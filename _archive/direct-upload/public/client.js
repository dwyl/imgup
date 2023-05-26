var uploadDemo = (function () {
  var filename

  function saveFile (file) {
    filename = file[0].name
  }

  function submitFile () {
    getCredentialsFromServer(filename)
  }

  function getCredentialsFromServer (filename) {
    var xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = function () {
      if (this.readyState === 4 && this.status === 200) {
        var s3Data = JSON.parse(xhttp.responseText)
        buildAndSubmitForm(s3Data)
        var successMessage = document.createElement('h4')
        successMessage.innerHTML = 'Image Successfully Uploaded at: '
        var link = `${s3Data.endpoint_url}/${s3Data.filename}`
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
    var contentTypeInput = document.createElement('input')
    keyInput.setAttribute('type', 'hidden')
    keyInput.setAttribute('name', 'key')
    keyInput.setAttribute('value', s3Data.filename)
    contentTypeInput.setAttribute('type', 'hidden')
    contentTypeInput.setAttribute('name', 'Content-Type')
    contentTypeInput.setAttribute('value', 'image/jpg')
    form.setAttribute('method', 'post')
    form.setAttribute('action', s3Data.endpoint_url)
    form.setAttribute('enctype', 'multipart/form-data')
    form.insertBefore(keyInput, form.firstChild)
    form.insertBefore(contentTypeInput, form.firstChild)
    form.url = s3Data.endpoint_url
    form.formData = s3Data.params
    form.submit()
  }

  return {
    saveFile,
    submitFile
  }
}())
