var test = require('tape')
var Server = require('../lib/index.js')

test('checks our /s3_credentials GET endpoint', function (t) {
  var options = {
    method: 'GET',
    url: '/s3_credentials'
  }
  Server.start((err, server) => {
    if (err) {
      console.log(err)
    }
    server.inject(options, function (response) {
      t.equal(response.statusCode, 200, '200 status code returned - ✅')
      server.stop(t.end)
    })
  })
})

test('POST request to /s3_credentials should return 404', function (t) {
  var options = {
    method: 'POST',
    url: '/s3_credentials'
  }
  Server.start((err, server) => {
    if (err) {
      console.log(err)
    }
    server.inject(options, function (response) {
      console.log(response.result)
      t.equal(response.statusCode, 404, '404 status code returned - ✅')
      server.stop(t.end)
    })
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
