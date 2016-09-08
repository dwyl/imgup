var crypto = require('crypto')
var AWSAccessKey = require('./aws-config.json').AWSAccessKeyId

var bucket = 'dwyl-direct-upload'
var region = 'eu-west-1'
var folder = 'image-uploads'
var expiration = '2016-09-28T12:00:00.000Z' // hard coded for testing
var date = JSON.stringify(new Date()) // hard coded for testing
var serviceName = 's3'

var amzCredential = AWSAccessKey + '/' + date + '/' + region + '/' + serviceName + '/aws4_request'

var s3Policy = {
  'expiration': expiration,
  'conditions': [
    {bucket: bucket},
    ['starts-with', '$key', folder],
    {AWSAccessKeyId: AWSAccessKey},
    {acl: 'private'},
    ['starts-with', '$Content-Type', 'image/'],
    {'x-amz-meta-uuid': '14365123651274'},
    {'x-amz-credential': amzCredential},
    {'x-amz-algorithm': 'AWS4-HMAC-SHA256'},
    {'x-amz-date': date},
    ['starts-with', '$x-amz-meta-tag', '']
  ]
}
var base64Policy = new Buffer(JSON.stringify(s3Policy), 'utf8').toString('base64')

var signature = crypto.createHmac('sha1', AWSAccessKey)
    .update(new Buffer(base64Policy, 'utf8')).digest('base64')

function getBase64Policy () {
  return base64Policy
}

function getAWSAccessKey () {
  return AWSAccessKey
}

function getS3Signature () {
  return signature
}

document.getElementById('date').value = date
document.getElementById('credential').value = amzCredential
document.getElementById('awsAccess').value = AWSAccessKey
document.getElementById('base64').value = base64Policy
document.getElementById('sig').value = signature

console.log('AWSAccessKey', getAWSAccessKey())
console.log('Base', getBase64Policy())
console.log('s3Signature', getS3Signature())
