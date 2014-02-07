var Writable = require('readable-stream').Writable;
var util = require('util');
util.inherits(MakeStream, Writable);
module.exports = MakeStream;
function MakeStream(obj) {
  Writable.call(this, { 
    objectMode: true,
    decodeStrings:false
  });
  this.obj = obj;
}
var i = 0;
MakeStream.prototype.doneWriting = function (cb, err) {
  this.obj.stopWriting(function (er) {
    cb(er||err);
  });
};
MakeStream.prototype._write = function (doc, _, cb) {
  var self = this;
  self.obj.startWriting(function (err) {
    if (err) {
      return cb(err);
    }
    if (doc.tile) {
      return self.obj.putTile(doc.z, doc.x, doc.y, doc.tile, function (err, resp){
        self.doneWriting(cb, err);
      });
    } else if (doc.grid) {
      return self.obj.putGrid(doc.z, doc.x, doc.y, doc.grid, function (err, resp){
        self.doneWriting(cb, err);
      });
    } else if (doc.name) {
      return self.obj.putInfo(doc, function (err, resp){
        self.emit('info');
        self.doneWriting(cb, err);
      });
    }
  });
};