// require('env2')('./.env')
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
      console.log('-------->', request.payload)
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
