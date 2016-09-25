var crypto = require('crypto')

function getS3Credentials (config, filename) {
  return {
    endpoint_url: 'https://' + config.bucket + '.s3.amazonaws.com',
    params: buildS3Params(config, filename)
  }
}

function buildS3Params (config, filename) {
  var credential = formatAmzCredential(config)
  var policy = buildS3UploadPolicy(config, filename, credential)
  var policyBase64 = new Buffer(JSON.stringify(policy)).toString('base64')
  return {
    key: filename,
    acl: 'public-read',
    success_action_status: '201',
    policy: policyBase64,
    'x-amz-algorithm': 'AWS4-HMAC-SHA256',
    'x-amz-credential': credential,
    'x-amz-date': dateString() + 'T000000Z',
    'x-amz-signature': buildS3UploadSignature(config, policyBase64, credential)
  }
}

function formatAmzCredential (config) {
  return [config.accessKey, dateString(), config.region, 's3/aws4_request'].join('/')
}

function buildS3UploadPolicy (config, filename, credential) {
  return {
    expiration: new Date((new Date()).getTime() + (3 * 60 * 1000)).toISOString(),
    conditions: [
      { bucket: config.bucket },
      { key: filename },
      { acl: 'public-read' },
      { success_action_status: '201' },
      {'Content-Type': 'image/*'},
      ['content-length-range', 0, 100000000000],
      { 'x-amz-algorithm': 'AWS4-HMAC-SHA256' },
      { 'x-amz-credential': credential },
      { 'x-amz-date': dateString() + 'T000000Z' }
    ]
  }
}

function dateString () {
  var date = new Date().toISOString()
  return date.substr(0, 4) + date.substr(5, 2) + date.substr(8, 2)
}

function buildS3UploadSignature (config, policyBase64, credential) {
  var dateKey = hmac('AWS4' + config.secretKey, dateString())
  var dateRegionKey = hmac(dateKey, config.region)
  var dateRegionServiceKey = hmac(dateRegionKey, 's3')
  var signingKey = hmac(dateRegionServiceKey, 'aws4_request')
  return hmac(signingKey, policyBase64).toString('hex')
}

function hmac (key, string) {
  var hmac = crypto.createHmac('sha256', key)
  hmac.end(string)
  return hmac.read()
}

module.exports = {
  getS3Credentials: getS3Credentials
}
