var test = require('tape')
var server = require('../lib/index.js')

test('checks our /s3_credentials GET endpoint with filename', function (t) {
  var filename = 'test'
  var options = {
    method: 'GET',
    url: `/s3_credentials?filename=${filename}`
  }
  server.inject(options, function (response) {
    t.equal(response.statusCode, 200, '✅ 200 status code returned')
    t.end(server.stop(function () {}))
  })
})

test('checks our /s3_credentials GET endpoint returns 400 when no filename is specified', function (t) {
  var filename = ''
  var options = {
    method: 'GET',
    url: `/s3_credentials?filename=${filename}`
  }
  server.inject(options, function (response) {
    t.equal(response.statusCode, 400, '✅ 400 status code returned')
    t.end(server.stop(function () {}))
  })
})

test('checks GET request for our index.html', function (t) {
  var options = {
    method: 'GET',
    url: '/'
  }
  server.inject(options, function (response) {
    t.equal(response.statusCode, 200, '✅ 200 status code returned')
    t.end(server.stop(function () {}))
  })
})

test('checks GET request for our index.html', function (t) {
  var options = {
    method: 'GET',
    url: '/client.js'
  }
  server.inject(options, function (response) {
    t.equal(response.statusCode, 200, '✅ 200 status code returned')
    t.end(server.stop(function () {}))
  })
})
