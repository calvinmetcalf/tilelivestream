var duplex = require('duplexer');
var ReadStream = require('./readable');
var WriteStream = require('./writable');
module.exports = function(obj, info){
  var readable = new ReadStream(obj, info);
  var writable = new WriteStream(obj);
  writable.on('info', function(){
    readable.prepare();
  });
  return duplex(writable, readable);
};
