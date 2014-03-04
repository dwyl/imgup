var fs = Npm.require('fs'),                  // for writing local (temp) files
    knox = Meteor.require('knox'),            // uploading to S3
    crypto = Npm.require('crypto'),          // used to create hash of image 
    path = Npm.require('path'),              // used for getting file extension
    tmp = Meteor.require('tmp'),             // creates temporary directory      
    im = Meteor.require('Imagemagick'),      // re-size images
    encoding = 'binary',                     // default encoding
    resizeWidths = { "mobile_":640, 
                     "thumb_":150, "full_":1200};        // dimensions for re-sized images

var AWS_ACCESS_KEY_ID='AKIAIK6S2HJHV664GW6Q',
AWS_SECRET_ACCESS_KEY='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',
s3baseurl = 'https://p360tilr.s3.amazonaws.com/',
acl = { 'x-amz-acl': 'public-read' };

var client = knox.createClient({
      key: AWS_ACCESS_KEY_ID,
      secret: AWS_SECRET_ACCESS_KEY,
      bucket: 'p360tilr',
      region: 'eu-west-1'
});

/**
 * Handles uploading images, resizing them and pushing them to S3
 * http://stackoverflow.com/questions/7329128/how-to-write-binary-data-to-a-file-using-node-js
 */
Meteor.methods({
  saveFile: function(blob, name) {

    var ext = path.extname(name).toLowerCase(),  // http://stackoverflow.com/questions/10865347
      filename = crypto.createHash('sha1').update(blob).digest('hex') +ext,
      images = { 
        full:   s3baseurl+"full_"+filename,
        mobile: s3baseurl+"mobile_"+filename,
        thumb:  s3baseurl+"thumb_"+filename
      }; // a hash containing all the links to images
        

    console.log(">> File Name: ",filename);

    // create temporary directory for our image uploads on local
    // this tmp.dir will be deleted on process exit 
    // details: https://github.com/raszi/node-tmp
    tmp.dir(function _tempDirCreated(err, tmpath) {
      if (err) throw err;

      // console.log(">> TEMP Dir: ", tmpath);
      var fd = tmpath +'/' +filename;

      // save the original file (temporarily) so we can use it in re-sizing
      fs.writeFile(fd, blob, encoding, function(err) {

        if (err) {
          throw (new Meteor.Error(500, 'Failed to save file. ', err));
        } else {
          console.log('The file saved to ' + fd);

          // get the dimensions of the original file
          im.identify(fd, function(err, oi){
            if(err) { 
              throw (new Meteor.Error(500, 'Could not read image metadata. ', err));
            }

            // upload full-size to S3
            client.putFile(fd, "full_"+filename, acl, function(err, res){
              if (err) { throw err;  } else {
                // console.log(">>> S3 : "+s3baseurl+"full_"+filename);
                res.resume();
              }
            });


            var thumb = tmpath+'/thumb_'+filename;

            im.resize({
              srcPath: fd,
              dstPath: thumb,
              width:   resizeWidths.thumb_,
              quality: 0.6
            }, function(err, stdout, stderr){
              if (err) throw err;
              // console.log('resized '+thumb );
              // upload thumbnail version to S3
              client.putFile(thumb, "thumb_"+filename, acl, function(err, res){
                if (err) { throw err;  } else {
                  res.resume();
                }
              });
            });

            // check if we need to re-size the image
            // if its already too small
            if(oi.width > resizeWidths.mobile ) {

              // console.log("Image Width:",oi.width);

              var mobile = tmpath+'/mobile_'+filename;

              im.resize({
                srcPath: fd,
                dstPath: mobile,
                width:   resizeWidths.mobile_,
                quality: 0.6
              }, function(err, stdout, stderr){
                if (err) throw err;
                console.log('resized '+mobile );
                // upload mobile version to S3
                client.putFile(mobile, "mobile_"+filename, acl, function(err, res){
                  if (err) { throw err;  } else {
                    // console.log(">>> S3 : "+s3baseurl+"full_"+filename);
                    res.resume();
                  }
                });
              });

            } else { 
              // the original image width was too small
              // so just add the default image to images object.
              console.log("No need to re-size image with width ", oi.width)


            }
          }); // im.identify
        } 
      }); 
    });
    return JSON.stringify(images);
  } // saveFile
});
