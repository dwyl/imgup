var test = require('tape')
var generateCredentials = require('../generate-credentials.js')
var getS3Credentials = generateCredentials.tests.pureGetS3Credentials
var formatAmzCredential = generateCredentials.tests.formatAmzCredential
var buildS3UploadPolicy = generateCredentials.tests.buildS3UploadPolicy
var dateString = generateCredentials.tests.dateString

var config = {
  accessKey: 'testAccess',
  secretKey: 'testSecret',
  bucket: 'testBucket',
  region: 'testRegion'
}
var filename = 'testFilename'
var credential = 'testCredential'
var dateStringT = 'testDateStringT'
var expiration = 'testExpiration'

test('getS3Credentials', function (t) {
  var policyBase64 = 'testPolicyBase64'
  var s3Signature = 'testS3Signature'
  var s3Credentials = getS3Credentials(config, filename, credential, policyBase64, dateStringT, s3Signature, expiration)
  var expected = {
    endpoint_url: 'https://' + 'testBucket' + '.s3.amazonaws.com',
    filename: 'testFilename',
    params: {
      acl: 'public-read',
      key: 'testFilename',
      policy: 'testPolicyBase64',
      success_action_status: '201',
      'x-amz-algorithm': 'AWS4-HMAC-SHA256',
      'x-amz-credential': 'testCredential',
      'x-amz-date': 'testDateStringT',
      'x-amz-signature': 'e57a6a4f6feb81e41ccca1f5c9abc25e9ab16731748f0118c1bbce33e8c00483'
    }
  }
  t.deepEqual(s3Credentials, expected, '✅ correct s3 credentials returned')
  t.end()
})

test('formatAmzCredential', function (t) {
  var date = 'testDate'
  var amzCredential = formatAmzCredential(config, date)
  var expected = 'testAccess/testDate/testRegion/s3/aws4_request'
  t.deepEqual(amzCredential, expected, '✅ amz credential formatted correctly')
  t.end()
})

test('buildS3UploadPolicy', function (t) {
  var s3UploadPolicy = buildS3UploadPolicy(config, filename, credential, dateStringT, expiration)
  var expected = {
    conditions: [
      { bucket: 'testBucket' },
      { key: 'testFilename' },
      { acl: 'public-read' },
      { success_action_status: '201' },
      { 'Content-Type': 'image/*' },
      [ 'content-length-range', 0, 100000000000 ],
      { 'x-amz-algorithm': 'AWS4-HMAC-SHA256' },
      { 'x-amz-credential': 'testCredential' },
      { 'x-amz-date': 'testDateStringT' } ],
    expiration: 'testExpiration'
  }
  t.deepEqual(s3UploadPolicy, expected, '✅ correct s3 policy returned')
  t.end()
})

test('dateString', function (t) {
  var date = 'testDate'
  var dateStr = dateString(date)
  var expected = 'testat'
  t.equal(dateStr, expected, '✅ correct dateString returned')
  t.end()
})
