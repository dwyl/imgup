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
        
        console.log(">>> Base ", base);
        console.log("File Name: ",name);
    
    fs.writeFile(filepath + name, blob, encoding, function(err) {
      console.log(path, name);
      if (err) {
        throw (new Meteor.Error(500, 'Failed to save file.', err));
      } else {
        console.log('The file ' + name + ' (' + encoding + ') was saved to ' + filepath);
      }
    }); 
 

  }
});