var test = require('tape')
var server = require('../server.js')

test('simple server test', function (t) {
  var options = {
    method: 'GET',
    url: '/'
  }
  server.inject(options, function (response) {
    t.equal(response.statusCode, 200)
    server.stop(t.end)
  })
})
