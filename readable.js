var Transform = require('readable-stream').Transform;
var st = require('streamoftiles');
var util = require('util');
util.inherits(MakeStream, Transform);
module.exports = MakeStream;
function MakeStream(obj) {
  Transform.call(this, {
    objectMode: true
  });
  this.obj = obj;
  this.prepare();
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
MakeStream.prototype.prepare = function () {
  var self = this;
  if(self.base){
    self.base.unpipe(self);
    delete self.base;
  }
  self.obj.getInfo(function (err, info) {
    if (err) {
      console.log(err);
      return;
    }
    if(!info.minzoom||!info.maxzoom||!info.bounds){
      return;
    }
    var minzoom = info.minzoom;
    var maxzoom = info.maxzoom;
    var bbox = info.bounds;
    self.base = new st(minzoom, maxzoom, bbox);
    if (info.template) {
      self.grid = true;
    }else{
      self.grid = false;
    }
    self.base.pipe(self);
  });
};