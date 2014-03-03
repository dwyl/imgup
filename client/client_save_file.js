Template.example.events({
  'change input': function(ev) {  
    console.log("Changed ",ev)
    _.each(ev.srcElement.files, function(file) {
      Meteor.saveFile(file, file.name);
    });
  }
});


/**
 * saveFile uses HTML5 FileReader https://developer.mozilla.org/en-US/docs/Web/API/FileReader
 * If you are supporting IE<10 look elsewhere, sorry. http://caniuse.com/#search=FileReader
 * @blob (https://developer.mozilla.org/en-US/docs/DOM/Blob)
 * @name the file's name
 * @type the file's type: binary, text (https://developer.mozilla.org/en-US/docs/DOM/FileReader#Methods) 
 *
 */
Meteor.saveFile = function(blob, name, callback) {
  var fileReader = new FileReader(),
    method   = 'readAsBinaryString';
 
  fileReader.onload = function(file) {
    Meteor.call('saveFile', file.srcElement.result, name, callback);
  }
  fileReader[method](blob);
  
  // if(typeof callback !== "undefined") {
  //   callback(); 
  // }
}