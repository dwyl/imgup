var 
fs           = Npm.require('fs'),             // for writing local (temp) files
knox         = Meteor.require('knox'),        // uploading to S3
crypto       = Npm.require('crypto'),         // used to create hash of image 
path         = Npm.require('path'),           // used for getting file extension
tmp          = Meteor.require('tmp'),         // creates temporary directory 
tmpath,     
im           = Meteor.require('Imagemagick'), // re-size images
gm           = Meteor.require('gm').subClass({ imageMagick: true }), // graphics magic
encoding     = 'binary',                      // default encoding
oi           = {},                            // original image
resizeWidths = { "mobile_":480, 
                 "thumb_":200,                // dimensions for re-sized images
                 "full_":1200 },
config = JSON.parse(Assets.getText("config.json")),
s3baseurl    = 'https://'+config.S3_BUCKET+'.s3.amazonaws.com/',
acl          = { 'x-amz-acl': 'public-read' },
client       = knox.createClient({
  key:    config.AWS_ACCESS_KEY_ID,
  secret: config.AWS_SECRET_ACCESS_KEY,
  bucket: config.S3_BUCKET,
  region: config.AWS_REGION
});

console.log(config.AWS_REGION);


/**
 * Handles uploading images, resizing them and pushing them to S3
 * http://stackoverflow.com/questions/7329128/how-to-write-binary-data-to-a-file-using-node-js
 */

Meteor.methods({
  saveFile: function(blob, name) {

    var ext = path.extname(name).toLowerCase(),  // file extension
      filename = crypto.createHash('sha1').update(blob).digest('hex') +ext,
      images = imagesObject(filename);

    // create temporary directory for our image uploads on local
    // this tmp.dir will be deleted on process exit 
    tmp.dir(function _tempDirCreated(err, tempPath) {
      if (err) throw err;
      tmpath = tempPath;
      var fd = tmpath +'/' +filename;  // original file descriptor

      // save the original file (temporarily) so we can use it in re-sizing
      fs.writeFile(fd, blob, encoding, function(err) {
        if (err) {
          throw (new Meteor.Error(500, 'Failed to save file. ', err));
        } else {

          im.identify(fd, function(err, oi){ // get the dimensions of the original file
            if(err) { 
              throw (new Meteor.Error(500, 'Could not read image metadata. ', err));
            }

            uploadToS3(fd, "full_"+filename);        // upload full-size to S3
            resizeAndUpload(fd, filename, 'thumb_'); // create thumbnail and upload

            if(oi.width > resizeWidths.mobile_ ) {   // check if upload is too small
              resizeAndUpload(fd, filename, 'mobile_');
            } else { // the original image width was too small 
              uploadToS3(fd, "mobile_"+filename); // upload full size as mobile version
            }
          }); // im.identify
        } 
      }); 
    });
    return JSON.stringify(images);
  } // saveFile
});

function resizeAndUpload(originalFile, filename, prefix) {
    var resizedFile = tmpath+'/'+prefix+filename;

    im.resize({
      srcPath: originalFile,
      dstPath: resizedFile,
      width:   resizeWidths[prefix],
      quality: 0.6
    }, function(err, stdout, stderr){
      if (err) throw err;
      uploadToS3(resizedFile, prefix+filename); // upload mobile version to S3
    });
}

function uploadToS3(localfile, remotefilename){
  client.putFile(localfile, remotefilename, acl, function(err, res){
    if (err) { throw err;  } else {
    // console.log(">>> S3 : "+s3baseurl+"full_"+filename);
      res.resume();
    }
  });
}


// creates an object with various urls to be sent back to client
function imagesObject(filename){
  // a hash containing all the links to images
  var images = { 
    full:   s3baseurl+"full_"+filename,
    mobile: s3baseurl+"mobile_"+filename,
    thumb:  s3baseurl+"thumb_"+filename
  };
  return images;
}

// always clean up temporary files
tmp.setGracefulCleanup();