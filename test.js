var tileStream = require('./');
var mbtiles = require('mbtiles');
var tilelive = require('tilelive');
var es = require('event-stream');
mbtiles.registerProtocols(tilelive);
var should = require('chai').should();
describe('tilelivestream', function() {
  it('should work with tiles', function(done){
    tilelive.load('mbtiles://./test.mbtiles', function(err, data) {
      if (err) {
        done(err);
        return;
      }
      var num = 0;
      var through = es.mapSync(function(data){
        if(data.tile){
          num++;
        }
      });
      through.on('end', function(){
        num.should.equal(17);
        done();
      });
      tileStream(data).pipe(through);
    });
  });
  it('should work with grids', function(done){
    tilelive.load('mbtiles://./test.mbtiles', function(err, data) {
      if (err) {
        done(err);
        return;
      }
      var num = 0;
      var through = es.mapSync(function(data){
        if(data.grid){
          num++;
        }
      });
      through.on('end', function(){
        num.should.equal(17);
        done();
      });
      tileStream(data).pipe(through);
    });
  });
  it('should work with both', function(done){
    tilelive.load('mbtiles://./test.mbtiles', function(err, data) {
      if (err) {
        done(err);
        return;
      }
      var num = 0;
      var through = es.mapSync(function(data){
        if(data.grid||data.tile){
          num++;
        }
      });
      through.on('end', function(){
        num.should.equal(34);
        done();
      });
      tileStream(data).pipe(through);
    });
  });
  it('should get info', function(done){
    tilelive.load('mbtiles://./test.mbtiles', function(err, data) {
      if (err) {
        done(err);
        return;
      }
      var through = es.mapSync(function(data){
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
      });
      tileStream(data).pipe(through);
    });
  });
});