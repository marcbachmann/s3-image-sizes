module.exports = {
  getPartialBuffer: getPartialBuffer,
  listStream: listStream
}

var _ = require('lodash')
var knox = require('knox')
var S3Lister = require('s3-lister')

var secret = require('./secret')
var config = {
  secret: secret.secret,
  key: secret.key,
  bucket: secret.bucket,
  region: secret.region
}

var s3 = knox.createClient({
  key: config.key,
  secret: config.secret,
  bucket: config.bucket,
  region: config.region
})

function getPartialBuffer (id, callback) {
  s3.getFile(id, function (err, res) {
    if (err) return callback(err)
    if (res.statusCode === 404) return callback(new Error('Not Found'))
    size = 0
    chunks = []

    var exit = _.once(function (err) {
      res.pause()
      res.emit('end')
      if (err) return callback(err)
      callback(null, Buffer.concat(chunks))
    })

    res.on('end', exit)
    res.on('error', exit)
    res.on('data', function (chunk) {
      size += chunk.length
      chunks.push(chunk)

      // We only need the first 128kb to retrieve the image size
      if (size > 128000) exit()
    })
  })
}

function listStream (options) {
  return new S3Lister(s3, options)
}
