/*  server.js

    Copyright (C) 2013, 2014, Reactive Sets

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

"use strict";

var rs      = require( '../../' )
  , RS      = rs.RS
  , extend  = RS.extend
;

require( '../../lib/filter.js' );
require( '../../lib/server/http.js' );
require( '../../lib/server/socket_io_clients.js' );
require( '../../lib/server/file.js' );
require( '../../lib/server/uglify.js' );
require( '../../lib/order.js' );

var servers = rs
  .set( [ // Define http servers
    { port: '8080', ip_address: '127.0.0.1' } // this application has only one server
  ] )
  
  .http_servers() // start http servers
;

var rs_dependencies = rs
  .set( [ { name: 'node-uuid/uuid.js' } ] )
  
  .require_resolve()
;

// Merge and mimify client javascript assets in realtime
var all_min_js = rs.union( [ rs_dependencies, rs
  .set( [ // Define the minimum set of javascript files required to serve this client application
    { path: '../../lib/rs.js'                  },
    { path: '../../lib/code.js'                },
    { path: '../../lib/query.js'               },
    { path: '../../lib/transactions.js'        },
    { path: '../../lib/pipelet.js'             },
    { path: '../../lib/filter.js'              },
    { path: '../../lib/join.js'                },
    { path: '../../lib/aggregate.js'           },
    { path: '../../lib/order.js'               },
    { path: '../../lib/selector.js'            },
    { path: '../../lib/table.js'               },
    { path: '../../lib/socket_io_crossover.js' },
    { path: '../../lib/socket_io_server.js'    },
    { path: 'client.js'                        }
  ] ) ] )
  
  .auto_increment() // Keeps track of files load order by adding an id attribute starting at 1
  
  .watch()                      // Retrieves files content with realtime updates
  
  .order( [ { id: 'id' } ] )    // Order files by auto_increment order before minifying
  
  .uglify( 'all-min.js', { warnings: false } )       // Minify in realtime using uglify-js and provide "all-min.map" source map
;

// Listen when all-min.js is ready
servers.http_listen( all_min_js );

// Other static assets
rs.set( [
    { path: 'index.html' },
    { path: 'table.css'  }
  ] )
  
  .watch()                 // Retrieves file content with realtime updates
  
  .union( [ all_min_js ] ) // Add minified assets
  
  .serve( servers ) // Deliver up-to-date compiled and mimified assets to clients
;

// Start socket servers on all http servers using socket.io
var clients = servers.socket_io_clients(); // Provide a dataflow of socket.io client connections

var sales = rs
  .configuration( { filepath: 'sales.json', flow: 'sales' } ) // The sales dataflow 
  
  .alter( function( sale ) {
    sale.year = parseInt( sale.date.substr( 0, 4 ), 10 );
  } )
;

sales
  .dispatch( clients, client )  // Serve 64k simultaneous user connexions over one core
;

function client ( source ) {
  
  var socket = this.socket;     // Socket to exchange data with web browser

  source                        // Dataflows from the database through dispatch()
    ._add_destination( socket ) // Send data to web browser
  ;

  return socket;
}
