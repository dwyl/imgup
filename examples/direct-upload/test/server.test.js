var test = require('tape')
var server = require('../lib/index.js')

test('simple server running', function (t) {
  var options = {
    method: 'GET',
    url: '/'
  }

  server.inject(options, function (response) {
    t.equal(response.statusCode, 200, '200 status code returned')
    server.stop(t.end)
  })
})

// test('Basic HTTP Tests - GET /{yourname*}', function (t) { // t
//   var options = {
//     method: 'GET',
//     url: '/s3_credentials'
//   }
//   // server.inject lets you similate an http request
//   server.inject(options, function (response) {
//     t.equal(response.statusCode, 200)  //  Expect http response status code to be 200 ('Ok')
//     server.stop(t.end) // t.end() callback is required to end the test in tape
//   })
// })
