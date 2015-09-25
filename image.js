var imageSize = require('image-size')
var s3 = require('./s3')

var workerFarm = require('worker-farm')
var workers = workerFarm({
  maxRetries: 0,
  maxCallsPerWorker: 20000,
  maxConcurrentCallsPerWorker: 1,
  maxCallTime: 5000,
  maxConcurrentWorkers: require('os').cpus().length
}, __filename, ['_getDimensions'])

var TransformStream = require('stream').Transform
var ImageTransformStream = function () {
  TransformStream.call(this, {objectMode: true})
}
require('util').inherits(ImageTransformStream, TransformStream)

ImageTransformStream.prototype._transform = function(obj, enc, done) {
  module.exports.getDimensions(obj.Key, function (err, dimensions) {
    if (err) return done(err)
    done(null, dimensions)
  })
  return true
}

module.exports = {
  getDimensions: function (id, callback) { workers._getDimensions(id, callback) },

  TransformStream: ImageTransformStream,

  _getDimensions: function (id, callback) {
    s3.getPartialBuffer(id, function (err, buffer) {
      if (err) return callback(err)
      var res = {id: id}
      try {
        var dim = imageSize(buffer)
        res.height = dim.height
        res.width = dim.width
       } catch (err) {
         res.error = {message: err.message, stack: err.stack}
       }
      callback(null, res)
    })
  }
}
