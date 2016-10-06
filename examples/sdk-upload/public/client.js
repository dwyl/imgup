var sdkDemo = (function () {
  function saveFile (uploadFile) {
    this.file = uploadFile[0]
    this.filename = this.file.name
  }

  function submitFile () {
    sendFileToServer(this.file, this.filename)
  }

  function sendFileToServer (file, filename) {
    var formData = new FormData()
    formData.append('file', file)
    formData.append('filename', filename)
    var xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = function () {
      if (this.readyState === 4 && this.status === 200) {
        var fileLocation = JSON.parse(xhttp.responseText).Location
        console.log('FRONT END DATA', fileLocation)
        var successMessage = document.createElement('h4')
        successMessage.innerHTML = 'Image Successfully Uploaded at: '
        var link = fileLocation
        var imageATag = document.querySelector('a')
        imageATag.setAttribute('href', link)
        var imageLink = document.createElement('h4')
        imageLink.innerHTML = link
        var div = document.querySelector('div')
        div.insertBefore(successMessage, div.firstChild)
        imageATag.appendChild(imageLink)
      }
    }
    xhttp.open('POST', '/file_submitted', true)
    xhttp.send(formData)
  }

  return {
    saveFile,
    submitFile
  }
}())
