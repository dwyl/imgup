require('env2')('./.env');

var AWS = require('aws-sdk');
AWS.config.region = process.env.AWS_REGION;

var fs = require('fs');
var mime = require('mime-types');
var Hapi = require('hapi');
var server = new Hapi.Server();

server.connection({
  port: Number(process.argv[2] || 8080)
}); // tell hapi which TCP Port to "listen" on


server.register(require('hapi-error'), function(err) {
  server.route({
    method: 'POST',
    path: '/submit',
    config: {
      payload: {
        output: 'stream',
        parse: true,
        allow: 'multipart/form-data'
      },
      handler: function(request, reply) {
        if (request.payload && request.payload.file) {

          var name = request.payload.file.hapi.filename;
          new AWS.S3({
            params: {
              Bucket: process.env.AWS_S3_BUCKET,
              ACL: 'public-read',
              Key: name,
              ContentType: mime.lookup(name)
            }
          }).upload({
            Body: request.payload.file._data
          })
          .on('httpUploadProgress', function(evt) {
            console.log(evt);
          })
          .send(function(err, data) {
            console.log(err, data);
            request.handleError(err, data);
            return reply(JSON.stringify(data));
          });
        }
      }
    }
  });
});

server.start(function() {
  console.log('info', 'Server running at: ' + server.info.uri);
});
