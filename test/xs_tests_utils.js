// Generated by CoffeeScript 1.4.0

/*
    xs_tests_utils.coffee

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


(function() {
  var XS, check, clone, expect, xs;

  if (typeof mocha !== 'undefined') {
    mocha.setup('bdd');
  }

  expect = this.expect = typeof require !== "undefined" && require !== null ? require('expect.js') : this.expect;

  clone = this.clone = function(o) {
    var p, r;
    if (typeof o !== 'object' || o === null) {
      return o;
    }
    r = o instanceof Array ? [] : {};
    for (p in o) {
      if (o.hasOwnProperty(p)) {
        r[p] = clone(o[p]);
      }
    }
    return r;
  };

  check = this.check = function(done, test) {
    try {
      test();
      return done();
    } catch (e) {
      return done(e);
    }
  };

  xs = this.xs = this.xs || require('../lib/pipelet.js');

  XS = xs.XS;

  this.log = function(message) {
    return XS.log('xs tests, ' + message);
  };

  describe('Test utilities', function() {
    describe('clone():', function() {
      var bar, foo;
      foo = {
        id: 10,
        array: [
          1, 2, "a", "b", 3, {
            x: 10,
            y: void 0,
            z: null
          }
        ],
        obj: {
          coordinate: 1,
          label: "Coordinate",
          values: [24, null, void 0]
        }
      };
      bar = clone(foo);
      return it('should deep clone foo into bar', function() {
        return expect(bar).to.be.eql(foo);
      });
    });
    return describe('Aynchronous test check()', function() {
      return it('should succeed in 50 ms', function(done) {
        return setTimeout((function() {
          return check(done, function() {
            return expect([]).to.be.eql([]);
          });
        }), 50);
      });
    });
  });

}).call(this);