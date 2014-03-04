/**
 * TODO support other encodings:
 * http://stackoverflow.com/questions/7329128/how-to-write-binary-data-to-a-file-using-node-js
 */
Meteor.methods({
  saveFile: function(blob, name) {

    var fs = Npm.require('fs'),
        crypto = Npm.require('crypto'),
        path = Npm.require('path'),
        base = process.env.PWD, // base node process path
        filepath = base + "/public/",
        encoding = 'binary',        // default encoding
        ext = path.extname(name),   // http://stackoverflow.com/questions/10865347
        name = crypto.createHash('sha1').update(blob).digest('hex') +ext;
        
        // console.log(">>> Base ", base);
        tempDir();
        console.log("File Name: ",name);
        // filepath = process.chdir(base);
        // attempt to save the file to the project's parent dir to avoid re-starting meteor
        // filepath = path.normalize(process.env.PWD +'/../');
        console.log(">>> norm ", filepath);

    fs.writeFile(filepath + name, blob, encoding, function(err) {
      // console.log(filepath, name);
      if (err) {
        throw (new Meteor.Error(500, 'Failed to save file.', err));
      } else {
        console.log('The file ' + name + ' (' + encoding + ') was saved to ' + filepath);
      }
    }); 
    var Imagemagick = Meteor.require('Imagemagick');

   // Imagemagick.identify(filepath + 'c92d4347745cfa5d7f2bdb1fff0d9ddfc127f381.jpg', function(err, features){
   //    if(err) { console.log("ERR: ",err); }
   //    console.log(features);
   //  });

 

  }
});


/**
 * used to check if we can write to parent directory
 *
 */
function tempDir() {
  var base = process.env.PWD,
  path = Npm.require('path'),
  crypto = Npm.require('crypto'),
  name = crypto.createHash('sha1').update('this').digest('hex')
  console.log(">> TEMP ", base, name);
  filepath = path.normalize(process.env.PWD +'/../');
  
}