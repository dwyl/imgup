var uploadDemo = (function () {
  // Requires jQuery and blueimp's jQuery.fileUpload

  // client-side validation by fileUpload should match the policy
  // restrictions so that the checks fail early
  var acceptFileType = /.*/i;
  var maxFileSize = 1000;
  // The URL to your endpoint that maps to s3Credentials function
  var credentialsUrl = '/s3_credentials';
  // The URL to your endpoint to register the uploaded file
  var uploadUrl = '/upload';
  var filename

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

  function saveFile (file) {
    console.log('<------------>', file[0].name)
    filename = file[0].name
  }

  function submitFile () {
    console.log('++++++++++++++', filename)
    getCredentialsFromServer(filename)
  }

  function getCredentialsFromServer (filename) {
    var xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = function () {
      if (this.readyState === 4 && this.status === 200) {
        var s3Data = JSON.parse(xhttp.responseText)
        console.log('GET RESPONSE', s3Data)
        buildAndSubmitForm(s3Data)
        var successMessage = document.createElement('h4')
        successMessage.innerHTML = 'Image Successfully Uploaded at: '
        var link = `https://dwyl-direct-upload.s3.amazonaws.com/${filename}`
        var imageATag = document.querySelector('a')
        imageATag.setAttribute('href', link)
        var imageLink = document.createElement('h4')
        imageLink.innerHTML = link
        var div = document.querySelector('div')
        div.insertBefore(successMessage, div.firstChild)
        imageATag.appendChild(imageLink)
      }
    }
    xhttp.open('GET', `/s3_credentials?filename=${filename}`, true)
    xhttp.send()
  }

  function buildAndSubmitForm (s3Data) {
    var form = document.querySelector('form')
    var keyInput = document.createElement('input')
    keyInput.setAttribute('type', 'hidden')
    keyInput.setAttribute('name', 'key')
    keyInput.setAttribute('value', `${filename}`)
    form.setAttribute('method', 'post')
    form.setAttribute('action', s3Data.endpoint_url)
    form.setAttribute('enctype', 'multipart/form-data')
    form.insertBefore(keyInput, form.firstChild)
    form.url = s3Data.endpoint_url
    form.formData = s3Data.params
    form.submit()
  }
  // This function retrieves s3 parameters from our server API and appends them
  // to the upload form.
  function s3add(e, data) {
    var filename = data.files[0].name;
    console.log('file name', data)
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
        console.log(s3Data.params);
        data.submit();
      }
    });
    console.log('PARAMS', params);
    return params;
  };

  function onS3Done(e, data) {
    var s3Url = $(data.jqXHR.responseXML).find('Location').text();
    var s3Key = $(data.jqXHR.responseXML).find('Key').text();
    // Typically, after uploading a file to S3, you want to register that file with
    // your backend. Remember that we did not persist anything before the upload.
    console.log($('<a/>').attr('href', s3Url).text(s3Url).appendTo($('body')));
  };

  return {
    saveFile,
    submitFile
    // all tje other stuff you need publicly
  }
}())
