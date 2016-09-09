var crypto = require("crypto");
var AWSAccessKey = require(".aws-config.json").AWSAccessKeyId

var bucket = 'dwyl-direct-upload'
var region = 'eu-west-1'
var folder = 'image-uploads'
var expiration = '2016-09-28T12:00:00.000Z' // hard coded for testing
var date = '20160908' // hard coded for testing
var serviceName = 's3'

exports.createS3Policy = function(contentType, callback) {
  var date = new Date();

  var s3Policy = {
    'expiration': expiration,
    'conditions': [
      {'bucket': bucket},
      ['starts-with', '$key', folder],
      {'AWSAccessKeyId': AWSAccessKey},
      {'acl': 'private'},
      ['starts-with', '$Content-Type', 'image/'],
      {'x-amz-meta-uuid': '14365123651274'},
      {'x-amz-credential': amzCredential},
      {'x-amz-algorithm': 'AWS4-HMAC-SHA256'},
      {'x-amz-date': date + 'T000000Z'}
    ]
  }

  // stringify and encode the policy
  var base64Policy = new Buffer(JSON.stringify(s3Policy), 'utf8').toString('base64')

  // sign the base64 encoded policy
  var signature = crypto.createHmac("sha1", config.secretKey)
    .update(new Buffer(base64Policy, "utf-8")).digest("base64");

  // build the results object
  var s3Credentials = {
    s3Policy: base64Policy,
    s3Signature: signature
  };

  // send it back
  callback(s3Credentials);
};
