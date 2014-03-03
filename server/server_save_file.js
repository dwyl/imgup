/**
 * TODO support other encodings:
 * http://stackoverflow.com/questions/7329128/how-to-write-binary-data-to-a-file-using-node-js
 */
Meteor.methods({
  saveFile: function(blob, name) {

    var fs = Npm.require('fs'),
        crypto = Npm.require('crypto'),
        base = process.env.PWD, // base node process path
        path = base + "/public/",
        // name = cleanName(name), 
        encoding = 'binary',    // default encoding
        // chroot = Meteor.chroot || '../../../../../public';
        ext = fileExtension(name),
        name = crypto.createHash('sha1').update(blob).digest('hex') +"."+ext;
        
        console.log(">>> Base ", base);
        console.log("File Name: ",name);
        // console.log("Encoding : ",encoding);

    // Clean up the path. Remove any initial and final '/' -we prefix them-,
    // any sort of attempt to go to the parent directory '..' and any empty directories in
    // between '/////' - which may happen after removing '..'
    
    // TODO Add file existance checks, etc...
    fs.writeFile(path + name, blob, encoding, function(err) {
      console.log(path, name);
      if (err) {
        throw (new Meteor.Error(500, 'Failed to save file.', err));
      } else {
        console.log('The file ' + name + ' (' + encoding + ') was saved to ' + path);
      }
    }); 
 

  }
});


function cleanPath(str) {
  if (str) {
    return str.replace(/\.\./g,'').replace(/\/+/g,'').
      replace(/^\/+/,'').replace(/\/+$/,'');
  }
}

function cleanName(str) {
  return str.replace(/\.\./g,'').replace(/\//g,'');
}

function fileExtension(filename) {
  console.log(">> Filename: ",filename);
  var ext = filename.split('.');
  return ext[ext.length - 1];
}