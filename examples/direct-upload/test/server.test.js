var test = require('tape')
var Server = require('../lib/index.js')

test('checks our /s3_credentials GET endpoint', function (t) {
  var options = {
    method: 'GET',
    url: '/s3_credentials'
  }
  Server.start(function (err, server) {
    if (err) {
      console.log(err)
    }
    server.inject(options, function (response) {
      t.equal(response.statusCode, 200, '200 status code returned - ✅')
      server.stop(t.end)
    })
  })
})

test('checks POST to /s3_credentials returns 404', function (t) {
  var options = {
    method: 'POST',
    url: '/s3_credentials'
  }
  Server.start(function (err, server) {
    if (err) {
      console.log(err)
    }
    server.inject(options, function (response) {
      t.equal(response.statusCode, 404, '404 status code returned - ✅')
      server.stop(t.end)
    })
  })
})

test('checks GET request for our index.html', function (t) {
  var options = {
    method: 'GET',
    url: '/'
  }
  Server.start(function (err, server) {
    if (err) {
      console.log(err)
    }
    server.inject(options, function (response) {
      t.equal(response.statusCode, 200, '200 status code returned - ✅')
      server.stop(t.end)
    })
  })
})

// test('checks our GET request for our index.html', function (t) {
//   Server.start((err, server) => {
//     if (err) {
//       console.log(err)
//     }
//     server.route({ method: 'GET', path: '/public/{path*}', handler: { directory: { path: './', listing: true } } })
//     server.inject('/public/index.html', function (response) {
//       t.equal(response.statusCode, 200, '200 status code returned - ✅')
//       server.stop(t.end)
//     })
//   })
// })
