var CryptoJS = require('crypto-js')
var AWSAccessKey = require('./aws-config.json').AWSAccessKeyId

var bucket = 'dwyl-direct-upload'
var region = 'eu-west-1'
var folder = 'image-uploads'
var expiration = '2016-09-28T12:00:00.000Z' // hard coded for testing
var date = '20160908' // hard coded for testing
var serviceName = 's3'

function getSignatureKey (key, dateStamp, regionName, serviceName) {
  var kDate = CryptoJS.HmacSHA256(dateStamp, 'AWS4' + key)
  var kRegion = CryptoJS.HmacSHA256(regionName, kDate)
  var kService = CryptoJS.HmacSHA256(serviceName, kRegion)
  var kSigning = CryptoJS.HmacSHA256('aws4_request', kService)
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
var s3Signature = CryptoJS.HmacSHA256(base64Policy, signatureKey).toString(CryptoJS.enc.Hex)

function getBase64Policy () {
  return base64Policy
}

function getAWSAccessKey () {
  return AWSAccessKey
}

function getS3Signature () {
  return s3Signature
}

document.getElementById('awsAccess').value = AWSAccessKey
document.getElementById('base64').value = base64Policy
document.getElementById('sig').value = s3Signature

console.log('AWSAccessKey', getAWSAccessKey())
console.log('Base', getBase64Policy())
console.log('s3Signature', getS3Signature())
