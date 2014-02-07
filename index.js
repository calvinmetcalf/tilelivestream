var st = require('streamoftiles');
var Transform = require('readable-stream').Transform;
var util = require('util');
util.inherits(MakeStream, Transform);
function MakeStream(obj) {
  Transform.call(this, {
    objectMode: true
  });
  this.obj = obj;
}
MakeStream.prototype._transform = function (data, encoding, callback) {
  var self = this;
  var todo;
  if (this.grid) {
    todo = 2;
  } else {
    todo = 1;
  }
  this.obj.getTile(data.z, data.x, data.y, function (err, tile) {
    if (tile) {
      self.push({
        x: data.x,
        y: data.y,
        z: data.z,
        tile: tile
      });
    }
    todo--;
    if(!todo){
      callback();
    }
  });
  if(this.grid){
    this.obj.getGrid(data.z, data.x, data.y, function (err, grid) {
    if (grid) {
      self.push({
        x: data.x,
        y: data.y,
        z: data.z,
        grid: grid
      });
    }
    todo--;
    if(!todo){
      callback();
    }
  });
  }
};
MakeStream.prototype._flush = function(callback) {
  var self  = this;
  this.obj.getInfo(function (err, data){
    if (err) {
      return callback(err);
    }
    self.push(data);
    callback();
  });
};
module.exports = function(obj){
  var stream = new MakeStream(obj);
  obj.getInfo(function (err, info) {
    if (err) {
      console.log(err);
      return;
    }
    var minzoom = info.minzoom || 0;
    var maxzoom = info.maxzoom || 18;
    var bbox = info.bounds || [-180, -85, 180, 85];
    var base = new st(minzoom, maxzoom, bbox);
    if (info.template) {
      stream.grid = true;
    }
    base.pipe(stream);
  });
  return stream;
};