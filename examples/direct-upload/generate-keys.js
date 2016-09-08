var Crypto = require('crypto')
var AWSAccessKey = require('./aws-config.json').AWSAccessKeyId

var bucket = 'dwyl-direct-upload'
var region = 'eu-west-1'
var folder = 'image-uploads'
var expiration = '2016-09-28T12:00:00.000Z' // hard coded for testing
var date = '20160908' // hard coded for testing
var serviceName = 's3'

function getSignatureKey (key, dateStamp, regionName, serviceName) {
  var kDate = Crypto.HmacSHA256(dateStamp, 'AWS4' + key)
  var kRegion = Crypto.HmacSHA256(regionName, kDate)
  var kService = Crypto.HmacSHA256(serviceName, kRegion)
  var kSigning = Crypto.HmacSHA256('aws4_request', kService)
  return kSigning
}

var s3Policy = {
  'expiration': expiration,
  'conditions': [
    {'bucket': bucket},
    ['starts-with', '$key', folder],
    {'AWSAccessKeyId': AWSAccessKey},
    {'acl': 'private'},
    ['starts-with', '$Content-Type', 'image/']
  ]
}
var base64Policy = new Buffer(JSON.stringify(s3Policy), 'utf-8').toString('base64')

var signatureKey = getSignatureKey(AWSAccessKey, date, region, serviceName)

function getBase64Policy () {
  return base64Policy
}

function getAWSAccessKey () {
  return AWSAccessKey
}

function getS3Signature () {
  var s3Signature = Crypto.HmacSHA256(base64Policy, signatureKey).toString(Crypto.enc.Hex)
  return s3Signature
}

console.log('AWSAccessKey', getAWSAccessKey())
console.log('base64Policy', getBase64Policy())
console.log('s3Signature', getS3Signature())
