var test = require('tape')
var server = require('../lib/index.js')

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

test('checks GET request for our client.js', function (t) {
  var options = {
    method: 'GET',
    url: '/client.js'
  }
  server.inject(options, function (response) {
    t.equal(response.statusCode, 200, '✅ 200 status code returned')
    t.end(server.stop(function () {}))
  })
})

test('checks POST request to our /file_submitted endpoint', function (t) {
  var options = {
    method: 'POST',
    url: '/file_submitted',
    payload: {
      file: 'test',
      filename: 'test'
    }
  }
  server.inject(options, function (response) {
    t.equal(response.statusCode, 200, '✅ 200 status code returned')
    t.end(server.stop(function () {}))
  })
})
