require('env2')('./.env')
var AWS = require('aws-sdk')
var crypto = require('crypto')
var path = require('path')
var handleError = require('hapi-error').handleError

AWS.config.region = process.env.AWS_S3_REGION

function upload (file, filename, callback) {
  var ext = '.' + path.extname(filename)
  var filenameHex = filename.replace(ext, '') +
   crypto.randomBytes(8).toString('hex') + ext
  var bucket = process.env.AWS_S3_BUCKET
  console.log(bucket)
  var s3Bucket = new AWS.S3({params: {Bucket: bucket}})
  var params = {Bucket: bucket, Key: filenameHex, Body: file}
  s3Bucket.upload(params, function (err, data) {
    handleError(err, data)
    callback(null, data)
  })
}

module.exports = {
  upload
}
