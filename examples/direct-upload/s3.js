var crypto = require('crypto');

// This is the entry function that produces data for the frontend
// config is hash of S3 configuration:
// * bucket
// * region
// * accessKey
// * secretKey
function s3Credentials(config, filename) {
  return {
    endpoint_url: "https://" + config.bucket + ".s3.amazonaws.com",
    params: s3Params(config, filename)
  }
}

// Returns the parameters that must be passed to the API call
function s3Params(config, filename) {
  var credential = amzCredential(config);
  var policy = s3UploadPolicy(config, filename, credential);
  var policyBase64 = new Buffer(JSON.stringify(policy)).toString('base64');
  return {
    key: filename,
    acl: 'public-read',
    success_action_status: '201',
    policy: policyBase64,
    'x-amz-algorithm': 'AWS4-HMAC-SHA256',
    'x-amz-credential': credential,
    'x-amz-date': dateString() + 'T000000Z',
    'x-amz-signature': s3UploadSignature(config, policyBase64, credential)
  }
}

function dateString() {
  var date = new Date().toISOString();
  return date.substr(0, 4) + date.substr(5, 2) + date.substr(8, 2);
}

function amzCredential(config) {
  return [config.accessKey, dateString(), config.region, 's3/aws4_request'].join('/')
}

// Constructs the policy
function s3UploadPolicy(config, filename, credential) {
  return {
    // 5 minutes into the future
    expiration: new Date((new Date).getTime() + (5 * 60 * 1000)).toISOString(),
    conditions: [
      { bucket: config.bucket },
      { key: filename },
      { acl: 'public-read' },
      { success_action_status: "201" },
      // Optionally control content type and file size
      // {'Content-Type': 'application/pdf'},
      ['content-length-range', 0, 100000000000],
      { 'x-amz-algorithm': 'AWS4-HMAC-SHA256' },
      { 'x-amz-credential': credential },
      { 'x-amz-date': dateString() + 'T000000Z' }
    ],
  }
}

function hmac(key, string) {
  var hmac = require('crypto').createHmac('sha256', key);
  hmac.end(string);
  return hmac.read();
}

// Signs the policy with the credential
function s3UploadSignature(config, policyBase64, credential) {
  var dateKey = hmac('AWS4' + config.secretKey, dateString());
  var dateRegionKey = hmac(dateKey, config.region);
  var dateRegionServiceKey = hmac(dateRegionKey, 's3');
  var signingKey = hmac(dateRegionServiceKey, 'aws4_request');
  return hmac(signingKey, policyBase64).toString('hex');
}

module.exports = {
  s3Credentials: s3Credentials
}
