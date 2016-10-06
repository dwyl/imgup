require('env2')('./.env')
var crypto = require('crypto')
var path = require('path')
var s3 = require('../generate-credentials')
var s3Config = {
  accessKey: process.env.AWS_S3_ACCESS_KEY,
  secretKey: process.env.AWS_S3_SECRET_KEY,
  bucket: process.env.AWS_S3_BUCKET,
  region: process.env.AWS_S3_REGION
}

module.exports = [
  {
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
      return reply.file(path.resolve(__dirname, '../public/index.html'))
    }
  },
  {
    method: 'GET',
    path: '/s3_credentials',
    handler: function (request, reply) {
      if (request.query.filename) {
        var ext = '.' + path.extname(request.query.filename)
        var filename = request.query.filename.replace(ext, '') +
          crypto.randomBytes(8).toString('hex') + ext
        return reply(s3.getS3Credentials(s3Config, filename))
      } else {
        return reply('Filename required').code(400)
      }
    }
  },
  {
    method: 'GET',
    path: '/{param*}',
    handler: {
      directory: {
        path: path.resolve(__dirname, '../public'),
        listing: true,
        index: false
      }
    }
  }
]
