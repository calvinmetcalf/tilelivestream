var tileStream = require('./');
var Readable = require('./readable');
var Writeable = require('./writable');
var MBTiles = require('mbtiles');
var through2 = require('through2');
var should = require('chai').should();
var fs = require('fs');
describe('tilelivestream', function() {
  describe('reading', function() {
    it('should work with tiles', function(done){
      new MBTiles('./test.mbtiles', function(err, data) {
        if (err) {
          done(err);
          return;
        }
        var num = 0;
        tileStream(data).pipe(through2.obj(function(data, _, next){
          if(data.tile){
            num++;
          }
          next();
        }, function(next){
          num.should.equal(17);
          done();
          next();
        }));
      });
    });
    it('should work with grids', function(done){
      new MBTiles('./test.mbtiles', function(err, data) {
        if (err) {
          done(err);
          return;
        }
        var num = 0;
        tileStream(data).pipe(through2.obj(function(data, _, next){
          if(data.grid){
            num++;
          }
          next();
        }, function(next){
          num.should.equal(17);
          done();
          next();
        }));
      });
    });
    it('should work with both', function(done){
      new MBTiles('./test.mbtiles', function(err, data) {
        if (err) {
          done(err);
          return;
        }
        var num = 0;
        tileStream(data).pipe(through2.obj(function(data, _, next){
          if(data.tile||data.grid){
            num++;
          }
          next();
        }, function(next){
          num.should.equal(34);
          done();
          next();
        }));
      });
    });
    it('should get info', function(done){
      new MBTiles('./test.mbtiles', function(err, data) {
        if (err) {
          done(err);
          return;
        }
        tileStream(data).pipe(through2.obj(function(data, _, next){
          if(data.name){
            delete data.center;
            delete data.bounds;
            delete data.filesize;
            data.should.deep.equal({
              scheme: 'tms',
              basename: 'test.mbtiles',
              id: 'test',
              minzoom: 6,
              maxzoom: 11,
              legend: '<!-- This legend uses Unicode box-drawing characters to approxmate line styles. -->\n<span style=\'color:#F56544\'>━</span> Motorways <br />\n<span style=\'color:#FFC53C\'>━</span> Main roads <br />\n<span style=\'color:#ccc\'>━</span> Other roads <br />\n<span style=\'color:#AC9\'>┉</span> Bike paths <br />\n<span style=\'color:#9CA\'>┉</span> Foot paths <br />\n<span style=\'color:#cea\'>▉</span> Park <br />\n<span style=\'color:#f8e8c8\'>▉</span> School <br />\n<span style=\'color:#c0d8ff\'>▉</span> Water',
              name: 'Open Streets, DC',
              description: 'An example of street-level map design.',
              attribution: 'Data used by this map is © OpenStreetMap contributors,  CC-BY-SA. See <http://openstreetmap.org> for more info.',
              template: '{{#__location__}}{{/__location__}}{{#__teaser__}}{{/__teaser__}}{{#__full__}}<ul><li>\n{{{id}}}</li><li>\n{{{osm_id}}}</li><li>\n{{{name}}}</li><li>\n{{{type}}}</li><li>\n{{{area}}}</li><li>\n{{{z_order}}}\n</li></ul>{{/__full__}}',
              version: '1.0.0'
            });
            done();
          }
          next();
        }));
      });
    });
  });
  describe('writing', function(){
    afterEach(function(done){
      fs.unlink('./test2.mbtiles', done);
    });
    it('should work', function(done){
      this.timeout(50000);
      new MBTiles('./test.mbtiles', function(err, db1) {
        if (err) {
          done(err);
          return;
        }
        new MBTiles('./test2.mbtiles', function(err, db2) {
          var num = 0;
          var n2 = 0;
          var s1 = new tileStream(db1);
          var s2 = new tileStream(db2);
          s1.pipe(s2);
          s1.on('end', function(){
            setTimeout(function(){
                new tileStream(db2).pipe(through2.obj(function(data, _, next){
                if(data.grid||data.tile){
                  num++;
                }
                next();
              }, function(next){
                num.should.equal(34);
                done();
                next();
              }));
            },1000);
          });
        });
      });
    });
  });
});