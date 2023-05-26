var s3 = require('../src/upload.js')
var path = require('path')

module.exports = [
  {
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
      return reply.file(path.resolve(__dirname, '../public/index.html'))
    }
  },
  {
    method: 'POST',
    path: '/file_submitted',
    handler: function (request, reply) {
      var file = request.payload.file
      var filename = request.payload.filename
      s3.upload(file, filename, function (err, data) {
        request.handleError(err, data)
        reply(data)
      })
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
