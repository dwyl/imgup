var crypto = require('crypto')

function getS3Credentials (config, filename) {
  var dateISO = new Date().toISOString()
  var dateStringT = dateString(dateISO) + 'T000000Z'
  var date = dateString(dateISO)
  var credential = formatAmzCredential(config, date)
  var expiration = new Date((new Date()).getTime() + (3 * 60 * 1000)).toISOString()
  var policy = buildS3UploadPolicy(config, filename, credential, dateStringT, expiration)
  var policyBase64 = new Buffer(JSON.stringify(policy)).toString('base64')
  var s3Signature = buildS3UploadSignature(config, policyBase64, credential, date)

  return pureGetS3Credentials(config, filename, credential, policyBase64, dateStringT, s3Signature, expiration)
}

function pureGetS3Credentials (config, filename, credential, policyBase64, dateString, s3Signature, expiration) {
  return {
    endpoint_url: 'https://' + config.bucket + '.s3.amazonaws.com',
    params: buildS3Params(config, filename, credential, policyBase64, dateString, expiration),
    filename: filename
  }
};

function buildS3Params (config, filename, credential, policyBase64, dateString, expiration) {
  return {
    key: filename,
    acl: 'public-read',
    success_action_status: '201',
    policy: policyBase64,
    'x-amz-algorithm': 'AWS4-HMAC-SHA256',
    'x-amz-credential': credential,
    'x-amz-date': dateString,
    'x-amz-signature': buildS3UploadSignature(config, policyBase64, credential, dateString, expiration)
  }
}

function formatAmzCredential (config, date) {
  return [config.accessKey, date, config.region, 's3/aws4_request'].join('/')
}

function buildS3UploadPolicy (config, filename, credential, dateString, expiration) {
  return {
    expiration: expiration,
    conditions: [
      { bucket: config.bucket },
      { key: filename },
      { acl: 'public-read' },
      { success_action_status: '201' },
      {'Content-Type': 'image/*'},
      ['content-length-range', 0, 100000000000],
      { 'x-amz-algorithm': 'AWS4-HMAC-SHA256' },
      { 'x-amz-credential': credential },
      { 'x-amz-date': dateString }
    ]
  }
}

function dateString (date) {
  return date.substr(0, 4) + date.substr(5, 2) + date.substr(8, 2)
}

function buildS3UploadSignature (config, policyBase64, credential, date) {
  var dateKey = hmac('AWS4' + config.secretKey, date)
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
  getS3Credentials
}

module.exports.tests = {
  pureGetS3Credentials,
  formatAmzCredential,
  buildS3UploadPolicy,
  dateString
}
