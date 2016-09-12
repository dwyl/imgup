// Requires jQuery and blueimp's jQuery.fileUpload

// client-side validation by fileUpload should match the policy
// restrictions so that the checks fail early
var acceptFileType = /.*/i;
var maxFileSize = 1000;
// The URL to your endpoint that maps to s3Credentials function
var credentialsUrl = '/s3_credentials';
// The URL to your endpoint to register the uploaded file
var uploadUrl = '/upload';

window.initS3FileUpload = function($fileInput) {
  $fileInput.fileupload({
    // acceptFileTypes: acceptFileType,
    // maxFileSize: maxFileSize,
    paramName: 'file',
    add: s3add,
    dataType: 'xml',
    done: onS3Done
  });
};

// This function retrieves s3 parameters from our server API and appends them
// to the upload form.
function s3add(e, data) {
  var filename = data.files[0].name;
  var params = [];
  $.ajax({
    url: credentialsUrl,
    type: 'GET',
    dataType: 'json',
    data: {
      filename: filename
    },
    success: function(s3Data) {
      data.url = s3Data.endpoint_url;
      data.formData = s3Data.params;
      data.submit();
    }
  });
  return params;
};

function onS3Done(e, data) {
  var s3Url = $(data.jqXHR.responseXML).find('Location').text();
  var s3Key = $(data.jqXHR.responseXML).find('Key').text();
  // Typically, after uploading a file to S3, you want to register that file with
  // your backend. Remember that we did not persist anything before the upload.
  console.log($('<a/>').attr('href', s3Url).text(s3Url).appendTo($('body')));
};
