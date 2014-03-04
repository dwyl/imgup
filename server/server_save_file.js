var fs = Npm.require('fs'),
    crypto = Npm.require('crypto'),          // used to create hash of image 
    path = Npm.require('path'),              // used for getting file extension
    tmp = Meteor.require('tmp'),             // creates temporary directory      
    im = Meteor.require('Imagemagick'),      // re-size images
    encoding = 'binary',                     // default encoding
    reSizes = { "mobile":640, "thumb":200 }; // dimensions for re-sized images

/**
 * TODO support other encodings:
 * http://stackoverflow.com/questions/7329128/how-to-write-binary-data-to-a-file-using-node-js
 */
Meteor.methods({
  saveFile: function(blob, name) {

    var ext = path.extname(name).toLowerCase(),  // http://stackoverflow.com/questions/10865347
      filename = crypto.createHash('sha1').update(blob).digest('hex') +ext;
        

        console.log(">> File Name: ",filename);

    // create temporary directory for our image uploads on local
    // this tmp.dir will be deleted on process exit 
    // details: https://github.com/raszi/node-tmp
    tmp.dir(function _tempDirCreated(err, tmpath) {
      if (err) throw err;

      // console.log(">> TEMP Dir: ", tmpath);
      var fd = tmpath +'/' +filename;

      // save the original file so we can use it in re-sizing
      fs.writeFile(fd, blob, encoding, function(err) {
        // console.log(filepath, name);
        if (err) {
          throw (new Meteor.Error(500, 'Failed to save file. ', err));
        } else {
          console.log('The file saved to ' + fd);

          im.identify(fd, function(err, oi){
            if(err) { 
              throw (new Meteor.Error(500, 'Could not read image metadata. ', err));
            }

            // check if we need to re-size the image
            // if its already too small
            if(oi.width > reSizes.mobile ) {
              console.log("Image Width:",oi.width);
              var mobile = tmpath+'/mobile_'+filename;

              im.resize({
                srcPath: fd,
                dstPath: mobile,
                width:   200,
                quality: 0.6
              }, function(err, stdout, stderr){
                if (err) throw err;
                console.log('resized '+mobile );
                // upload to S3

              });
            }
          // create smaller versions




          }); // im.identify



        } 
      }); 
    });
    return "bar";
  } // saveFile
});