var sdkDemo = (function () {
  var file

  function saveFile (uploadFile) {
    file = uploadFile[0]
  }

  function submitFile () {
    sendFileToServer(file)
  }

  function sendFileToServer (file) {
    var xhttp = new XMLHttpRequest()
    xhttp.open('POST', '/file_submitted', true)
    xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
    xhttp.send(file)
  }

  return {
    saveFile,
    submitFile
  }
}())
