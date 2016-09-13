var Hapi = require('hapi')
var Routes = require('./routes.js')
var Inert = require('inert')

exports.init = function (port, next) {
  var server = new Hapi.Server()
  server.connection({port: port})
  server.register([Inert, Routes], function (err) {
    if (err) {
      return next(err)
    }

    server.start(function (err) {
      if (err) console.log('error starting server: ', err)
      return next(err, server)
    })
  })
  module.exports = server
}
