/**
 * TODO support other encodings:
 * http://stackoverflow.com/questions/7329128/how-to-write-binary-data-to-a-file-using-node-js
 */
Meteor.methods({
  saveFile: function(blob, name, encoding) {
    
      


    var fs = Npm.require('fs'),
        nodepath = Npm.require('path'),
    path = cleanPath(path),
    name = cleanName(name || 'file'), 
    encoding = encoding || 'binary',
    chroot = Meteor.chroot || '../../../../../public';
    var base = process.env.PWD;
    console.log(">>> Base ", base);
    // Clean up the path. Remove any initial and final '/' -we prefix them-,
    // any sort of attempt to go to the parent directory '..' and any empty directories in
    // between '/////' - which may happen after removing '..'
    path = chroot + (path ? '/' + path + '/' : '/');
    console.log(">> Path: ",path, nodepath.normalize(path));
    
    // TODO Add file existance checks, etc...
    fs.writeFile(path + name, blob, encoding, function(err) {
      console.log(path, name);
      if (err) {
        throw (new Meteor.Error(500, 'Failed to save file.', err));
      } else {
        console.log('The file ' + name + ' (' + encoding + ') was saved to ' + path);
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
  }
});