var Hapi = require('hapi')
var crypto = require('crypto')
var path = require('path')
var s3 = require('./generate-credentials')
var s3Config = {
  accessKey: process.env.S3_ACCESS_KEY,
  secretKey: process.env.S3_SECRET_KEY,
  bucket: process.env.S3_BUCKET,
  region: process.env.S3_REGION
}

var server = new Hapi.Server()

server.connection({
  host: 'localhost',
  port: 8000
})

server.register(require('inert'),
(err) => {
  if (err) {
    throw err
  }
  server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
      reply.file('./public/index.html')
    }
  })
  server.route({
    method: 'GET',
    path: '/s3_credentials',
    handler: function (request, reply) {
      if (request.query.filename) {
        var filename =
        crypto.randomBytes(8).toString('hex') +
        path.extname(request.query.filename)
        reply(s3.getS3Credentials(s3Config, filename))
      } else {
        reply('Filename required')
      }
    }
  })
  server.route({
    method: 'GET',
    path: '/{filename*}',
    handler: {
      directory: {
        path: __dirname + '/public',
        listing: false,
        index: false
      }
    }
  })
})

server.start((err) => {
  if (err) {
    throw err
  }
  console.log(`Server running at: ${server.info.uri}`)
})
