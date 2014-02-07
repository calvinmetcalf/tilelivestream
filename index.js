var es = require('event-stream');
var ReadStream = require('./readable');
var WriteStream = require('./writable');
module.exports = function(obj){
  var readable = new ReadStream(obj);
  var writable = new WriteStream(obj);
  writable.on('info', function(){
    readable.prepare();
  });
  return es.duplex(writable, readable);
};