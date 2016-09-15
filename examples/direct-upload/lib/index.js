'use strict'

var Hapi = require('hapi')
var Inert = require('inert')
var assert = require('assert')

var server = new Hapi.Server()

server.connection({port: 8000})
server.register([Inert], function (err) {
  assert(!err) // not much point continuing without plugins ...

  server.route(require('./routes.js'))

  server.start(function (err) {
    assert(!err) // not much point continuing if the server does not start ...
    console.log('The server is running on: ', server.info.uri)
  })
})

module.exports = server
