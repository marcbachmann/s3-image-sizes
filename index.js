var _ = require('lodash')
var async = require('async')
var s3 = require('./s3')
var image = require('./image')

// Stream all dimensions
s3.listStream()
.on('error', console.error)
.pipe(new image.TransformStream)
.on('error', console.error)
.on('data', function (item) { console.log(JSON.stringify(item)) })
.on('end', function () { console.log('Completed')  })


// load one imageBuffer
// s3.getPartialBuffer('1970/01/01/1.10053427.1301296004.jpg', console.log)


// // get image dimensions from buffer
// image.getDimensions('1970/01/01/1.10053427.1301296004.jpg', function (err, dimensions) {
//   if (err) throw err
//   console.log('Dimensions: , JSON.stringify(dimensions))
// })
