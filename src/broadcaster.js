/*
   broadcaster.js
    define XS.broadcaster() and the XS.Broadcaster class.
  
    Copyright (C) 2013, Connected Sets

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

( function( exports ) {
  
  var XS;
 
  if ( typeof require === 'function' ) {
    XS = require( './xs.js' ).XS;
    require( './fork.js' );
  } else {
    XS = exports.XS;
  }
  
  var log         = XS.log
    , Connection  = XS.Fork
  ;

/*
 *  Monkey patching, until terminology get stable.
 */

var ProtoConnection = Connection.prototype;
ProtoConnection.connections_add    = ProtoConnection.forks_add;
ProtoConnection.connections_update = ProtoConnection.forks_update;
ProtoConnection.connections_remove = ProtoConnection.forks_remove;

  
 /* --------------------------------------------------------------------------
     de&&ug()
  */
  
  var de = true;
  
  function ug( m ) {
    log( "xs proxy, " + m );
  } // ug()
  
  var bug  = ug; // de&&bug or de&&ug


  /* --------------------------------------------------------------------------
     XS.void, XS.space
     XS.void is both an empty source and a /dev/null type of sink.
     XS.space is an alias, it enables access to remote system wide objects.
     
     Usage:
       var a_proxy      = XS.space.proxy( "something" );
       var a_subscriber = XS.space.subscriber( "some_publisher" );
   */

  function Void(){
    Connection.call( this );
    this.source = null;
    return this;
  }
  
  var noop     = function(){};
  // ToDo: figure out a wayt to intercept xx.connect( the_void ) so that
  // mutliple xx.connect( the_void ) don't bomb due to connect() checking
  // that the target does not already have a source.
  var identity = function(){ this.source = null; return this; };
  
  Connection.subclass( "void", Void, {
    factory:    function(){ return XS.the_void; },
    toString:   function(){ return "XS.void"; },
    connect:    identity,
    disconnect: identity,
    notify:     identity,
    add:        identity,
    update:     identity,
    remove:     identity,
  });
  
  // A singleton that can be both a inactive source or an inactive destination
  // ToDo: make XS be the void itself, so that XS.xxx() eqv to XS.space.xxx()
  XS.the_void = new Void();
  XS.void     = XS.the_void;
  XS.space    = XS.the_void;
  

 /* --------------------------------------------------------------------------
     a_source.broadcaster( options )
     A broadcaster has one or many sources and will forward all operations from
     these sources to its downsteam connections. It is state less.
     
     Usage:
       var b = a_source.broadcaster();
       b.from( additional_source );
       b.to( destination1 );
       b.to( destination2 );
     
     ToDo: move this to connection.js
  */
  
  function Broadcaster( sources, options ) {
    Connection.call( this, options );
    // Make x.connect( broadcaster ) invalid, please use broadcast.from( x )
    this.source = this;
    this.sources = sources || [];
    this.update_name();
    var big_a = this.get();
    this.add( big_a );
    return this;
  }
  
  Connection.subclass( "broadcaster", Broadcaster, {
    
    // ToDo: a_source.broadcaster( s2, s3, ...., options )
    // ToDo: a_source.broadcaster( an_array_of_sources, options )
    factory: function( options ){ return new Broadcaster( [this], options ); },
    
    toString: function() { return "Broadcaster/" + this.name },
    
    update_name: function(){
    // Private. Called when set of sources was changed.
    // It make it so that the name of the broadcaster is the concatenation of
    // the name of its sources. This is fairly arbitrary.
    // ToDo: find a better naming solution.
      var names = [];
      for ( var source in this.sources ) {
        source = this.sources[ source ];
        if ( source ){
          names.push( source.name );
        }
      }
      this.name = names.join( "," );
    },
    
    get: function(){
      var sources = this.sources;
      var all_get = [];
      for( var source in sources ){
        source = sources[source];
        all_get = all_get.push( source.get() );
      }
      var big_a = Array.prototype.concat.apply( [], all_get );
      return big_a;
    },
    
    from: function( source ) {
    // Add a source to the broadcaster
      this.sources.push( source );
      this.name += "," + source.name;
      this.add( source.get() );
      return this;
    },
    
    not_from: function( source ) {
    // Unconnect a source from the broadcaster
      var index = this.sources.indexOf( source );
      if ( index >= 0 ) {
        this.sources.splice( index, 1 );
        this.update_name();
      }
      return this;
    },
    
    to:     function( target  ) { return this.connect(    target );          },
    not_to: function( target  ) { return this.disconnect( target );          },
    
    // Simpli forward the operations to dependents, not storage
    add:    function( objects ) { return this.connections_add(    objects ); },
    remove: function( objects ) { return this.connections_remove( objects ); },
    update: function( objects ) { return this.connections_update( objects ); },
    
  } ); // Broadcaster
  

  /* -------------------------------------------------------------------------------------------
     module exports
  */
  eval( XS.export_code( 'XS', [ 'Broadcaster' ] ) );
  
  de&&ug( "module loaded" );
} )( this ); // broadcaster.js
