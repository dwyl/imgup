Template.example.events({
  'change input': function(ev) {  
    // console.log("Changed ",ev)
    _.each(ev.srcElement.files, function(file) {
      // progress bar
      progressBar(2000);
      $('#imgupload-button i').removeClass("fa-camera").addClass("fa-spinner fa-spin");
      // save the file
      Meteor.saveFile(file, file.name, function(error, result) {
        if(error) { console.log("ERROR: ", error); }
        images = JSON.parse(result);
        // console.dir(result);
        // console.log('File Saved '+images.thumb);
        setTimeout(function(){
          $("#thumbnails").prepend('<img class="thumb" src="'+images.thumb +'" />');
          // var width = window.innerWidth;
          // if(width < 650){
          //   $(".thumb").css("width",width+"px");
          // }
          $("#imgupload").val(''); 
          $('#imgupload-button i').removeClass("fa-spinner fa-spin").addClass("fa-camera");
        },2000)
      });
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
}

// using a logarithm and a setInterval to simulate progress bar
function progressBar(duration) {
  $("#upload-progress-container").fadeIn(100);
  var w = 0, i = 0, freq = duration/20;
  interval = setInterval(function(){
    i = i + 0.5;
    w = Math.floor(Math.log(i) / Math.log(10) * 100);
    // console.log("w : ",w);
    $("#upload-progress-bar").css("width",w+"%");
    $("#upload-progress-percent b").text(w);
    if(w === 100){
      clearInterval(interval);
      $("#upload-progress-bar").css("width",0+"%");
      $("#upload-progress-container").hide();
    }
  },freq);
}

$( function() {
  progressBar(500);
  console.log("event listner for fake upload button");
  $("#imgupload-button").click(function(){
    $("#imgupload").click(); 
    return false;
  });
});