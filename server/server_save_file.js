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
        encoding = 'binary',        // default encoding
        ext = fileExtension(name),
        name = crypto.createHash('sha1').update(blob).digest('hex') +"."+ext;
        
        console.log(">>> Base ", base);
        console.log("File Name: ",name);
    
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