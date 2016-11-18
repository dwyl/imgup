require('env2')('./.env');

var AWS = require('aws-sdk');
AWS.config.region = process.env.AWS_REGION;

var fs = require('fs');
var mime = require('mime-types');
var Hapi = require('hapi');
var server = new Hapi.Server();

server.connection({port: Number(process.argv[2] || 8080) }); // tell hapi which TCP Port to "listen" on



server.route({
    method: 'POST',
    path: '/submit',
    config: {

        payload: {
            output: 'stream',
            parse: true,
            allow: 'multipart/form-data'
        },

        handler: function (request, reply) {
            var data = request.payload;
            if (data.file) {

                var name = data.file.hapi.filename;
                // var path = __dirname + "/uploads/" + name;
                // var file = fs.createWriteStream(path);

                // file.on('error', function (err) {
                //     console.error(err)
                // });
                //
                // data.file.pipe(file);
                //
                // data.file.on('end', function (err) {
                //     var ret = {
                //         filename: data.file.hapi.filename,
                //         headers: data.file.hapi.headers
                //     }
                //     reply(JSON.stringify(ret));
                // });
                var s3Bucket = new AWS.S3({
                    params: {
                        Bucket: process.env.AWS_S3_BUCKET,
                        ACL: 'public-read',
                        Key: name,
                        ContentType: mime.lookup(name)
                    }
                });

                s3Bucket.upload({Body: data.file._data })
                .on('httpUploadProgress', function(evt) { console.log(evt); })
                .send(function(err, data) {
                  console.log(err, data);
                  request.handleError(err, data);
                  return reply(JSON.stringify(data));
                });

            }

        }
    }
});

server.start(function () {
    console.log('info', 'Server running at: ' + server.info.uri);
});
