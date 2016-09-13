var crypto = require('crypto')
var path = require('path')
var s3 = require('../generate-credentials')
var s3Config = {
  accessKey: process.env.S3_ACCESS_KEY,
  secretKey: process.env.S3_SECRET_KEY,
  bucket: process.env.S3_BUCKET,
  region: process.env.S3_REGION
}

exports.register = function (server, options, next) {
  server.route([
    {
      method: 'GET',
      path: '/',
      handler: function (request, reply) {
        reply.file('./public/index.html')
      }
    },
    {
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
    },
    {
      method: 'GET',
      path: '/{filename*}',
      handler: {
        directory: {
          path: 'public',
          listing: true,
          index: false
        }
      }
    }
  ])

  return next()
}

exports.register.attributes = {
  name: 'Routes'
}
