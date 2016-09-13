'use strict'

var Hapi = require('hapi')
var Routes = require('./routes.js')
var Inert = require('inert')

exports.start = function (callback) {
  var server = new Hapi.Server()
  server.connection({port: 8000})
  server.register([Inert, Routes], function (err) {
    if (err) {
      return callback(err, null)
    }

    server.start(function (err) {
      if (err) callback(err, null)
      return callback(null, server)
    })
  })
}
