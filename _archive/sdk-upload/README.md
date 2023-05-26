# SDK Upload to S3 - A Complete Guide

We are going to implement a simple solution for uploading images to an S3 bucket
using the AWS SDK.

![upload example](https://cloud.githubusercontent.com/assets/12450298/18955390/2996f122-864f-11e6-92f5-f2b4c631b2d7.png)

### Contents
- [Creating an S3 Bucket](#step-1---creating-the-bucket)
- [Creating IAM User with S3 Permissions](#step-2---creating-an-iam-user-with-s3-permissions)
- [AWS SDK Configuration](#step-3---configure-the-aws-adk)
- [Implement the SDK](#step-4---implement-the-sdk)
- [Create a Server](#step-5---create-a-server-to-handle-our-upload-file)
- [Client Side Code](#step-6---write-the-client-side-code-to-send-our-file-to-the-server)
- [Take it for a Spin](#take-it-for-a-spin)
- [Learning Resources](#learning-resources)

### Step 1 - Creating the bucket

In our direct-upload example we walk through the steps of how to create a new
bucket in S3. Check out [the tutorial](https://github.com/dwyl/image-uploads/blob/master/examples/direct-upload/README.md#step-1---creating-the-bucket)
and follow the steps.

### Step 2 - Creating an IAM user with S3 permissions

Just as in Step 1 we've already created a step-by-step process for creating a
new IAM user that has the correct permissions to access the bucket you created
[above](#step-1---creating-the-bucket). Take a look at [the tutorial](https://github.com/dwyl/image-uploads/blob/master/examples/direct-upload/README.md#step-2---creating-an-iam-user-with-s3-permissions)
and again follow the steps.

### Step 3 - Configure the AWS SDK

In order to upload to our S3 bucket, we have to use the AWS SDK. Install it using
the following command:

` npm install aws-sdk --save`

Next we'll need to configure our AWS SDK. You can do this in a number of ways.
We're going to create a credentials file at `~/.aws/credentials`. To do this we
take the following steps:

* open a new terminal window
* ` cd` this takes us back to the root of our file system
* ` mkdir .aws` creates a folder that will hold our credentials file
* ` cd mkdir` navigate to our `.aws` directory
* ` touch credentials` creates our credentials file
* Open your credentials file in your text editor and add the following:
```
[default]
aws_access_key_id = your_access_key_id
aws_secret_access_key = your_secret_key
```
* save the file
* close the terminal window

The credentials should be the ones associated with the IAM user you created in
[Step 2]((#step-2---creating-an-iam-user-with-s3-permissions)).

#### You will now be able to use the AWS SDK!

### Step 4 - Implement the SDK

First you'll need to set some environment variables. These are as follows:
> If you are new to Environment Variables see:
[github.com/dwyl/**learn-environment-variables**](https://github.com/dwyl/learn-environment-variables/)

`export AWS_S3_REGION=<YOUR_REGION>`
`export AWS_S3_BUCKET=<YOUR_BUCKET_NAME>`

Alternatively you could store your environment variables in a `.env` file and load
them in. We've written a module that can help you do this called
[env2](https://github.com/dwyl/env2).

Create a `src` directory in the root of your project. Create a file within this
directory called `upload.js`. This file will contain our SDK functionality.
Add the following to this file:

```js
// load the AWS SDK
var AWS = require('aws-sdk')
// crypto is used for our unique filenames
var crypto = require('crypto')
// we use path to add the relative file extension
var path = require('path')
// hapi-error to handle our errors
var handleError = require('hapi-error').handleError

// assign our region from our environment variables
AWS.config.region = process.env.AWS_S3_REGION

/**
* Returns data specific to our upload that we send to the front end
* @param {Buffer} file - file that we are uploading
* @param {string} filename - name of the file to be uploaded
* @param {function} callback
**/
function upload (file, filename, callback) {
  // creating our new filename
  var ext = '.' + path.extname(filename);
  var filenameHex = filename.replace(ext, '') +
   crypto.randomBytes(8).toString('hex') + ext;
  // loading our bucket name from our environment variables
  var bucket = process.env.AWS_S3_BUCKET
  // creating a new instance of our bucket
  var s3Bucket = new AWS.S3({params: {Bucket: bucket}})
  // sets the params needed for the upload
  var params = {Bucket: bucket, Key: filenameHex, Body: file}
  // SDK upload to S3
  s3Bucket.upload(params, function (err, data) {
    handleError(err, data)
    // callback with the data that gets returned from S3
    else callback(null, data)
  })
}

module.exports = {
  upload
}
```

We've now set up our S3 upload function!


### Step 5 - Create a server to handle our upload file

Create a directory called `lib`. This will hold our server + routes.

Create a file called `index.js` and add the following:

```js
'use strict'

var Hapi = require('hapi')
var Inert = require('inert')
var assert = require('assert')

// creating a new instance of our server
var server = new Hapi.Server()

// connecting to port 8000
server.connection({port: 8000})
// registering the Inert module which allows us to render static files
server.register([Inert], function (err) {
  assert(!err) // not much point continuing without plugins ...

  // adding our routes (we'll be creating this file next)
  server.route(require('./routes.js'))

  // starting the server
  server.start(function (err) {
    assert(!err) // not much point continuing if the server does not start ...
    console.log('The server is running on: ', server.info.uri)
  })
})

module.exports = server
```

Next create a file called `routes.js` and add the following:

```js
// require the function we just created
var s3 = require('../src/upload.js')
// path is needed to resolve the filepath to our index.html
var path = require('path')

module.exports = [
  // our index route
  {
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
      return reply.file(path.resolve(__dirname, '../public/index.html'))
    }
  },
  // our endpoint
  {
    method: 'POST',
    path: '/file_submitted',
    handler: function (request, reply) {
      // we'll be sending through a file along with it's filename
      var file = request.payload.file
      var filename = request.payload.filename
      // upload the file to S3
      s3.upload(file, filename, function (err, data) {
        if (err) console.log(err)
        // send the data back to the front end
        reply(data)
      })
    }
  },
  // this is for our static files
  {
    method: 'GET',
    path: '/{param*}',
    handler: {
      directory: {
        path: path.resolve(__dirname, '../public'),
        listing: true,
        index: false
      }
    }
  }
]
```

### Step 6 - Write the client side code to send our file to the server

Create a new directory called `public`. Create an `index.html` file within this
directory. Add the following to the file:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>S3 Upload Demo</title>
    <link rel="icon" href="http://downloadicons.net/sites/default/files/upload-icon-46097.png">
    <!-- optional stylesheet -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/flat-ui/2.2.2/css/flat-ui.min.css">
    <!-- link to our client side js file that we will create next -->
    <script type="text/javascript" src="client.js"></script>
  </head>
  <body>
    <h1>S3 Direct Upload Demo</h1>
    <br/>
    <!-- simple form with a file input -->
    <form>
      <input class="form-control input-sm" id="fileInput" type="file" name="file" onchange="uploadDemo.saveFile(this.files)"/>
    </form>
    <br/>
    <!-- submit button that will trigger our upload -->
    <button id="submit" class="btn btn-embossed btn-primary" onclick="uploadDemo.submitFile()">Submit</button>
    <!-- this will hold the link to our newly uploaded image -->
    <div class="successMessageContainer">
      <a class="imageLink"></a>
    </div>
  </body>
</html>
```

Create the javascript file that we're including in our html file and call it
`client.js`. Add the following to the file:

```js
// IIFE that will contain our global variables
var sdkDemo = (function () {
  // file that we want to upload
  var file
  // filename of that file
  var filename

  /**
  * Saves our file and filename to the relevant global variables
  * @param {Buffer} uploadFile - file that we are uploading
  **/
  function saveFile (uploadFile) {
    file = uploadFile[0]
    filename = file.name
  }

  /**
  * Calls our sendFileToServer function
  **/
  function submitFile () {
    sendFileToServer(file, filename)
  }

  /**
  * Sends file to server and returns link to uploaded file
  * @param {Buffer} file - file that we are uploading
  * @param {string} filename - name of the file to be uploaded
  **/
  function sendFileToServer (file, filename) {
    // creates a new FormData instance so we can send our image file
    var formData = new FormData()
    // append the file to the formData
    formData.append('file', file)
    // append the filename to the formData
    formData.append('filename', filename)
    // create a new XHR request
    var xhttp = new XMLHttpRequest()
    // wait for a 200 status (OK)
    xhttp.onreadystatechange = function () {
      if (this.readyState === 4 && this.status === 200) {
        // save the file location from the responseText
        var fileLocation = JSON.parse(xhttp.responseText).Location
        // add success message to index.html
        var successMessage = document.createElement('h4')
        successMessage.innerHTML = 'Image Successfully Uploaded at: '
        // create a link to the image
        var imageATag = document.querySelector('a')
        var link = fileLocation
        // set the link to the image location
        imageATag.setAttribute('href', link)
        var imageLink = document.createElement('h4')
        imageLink.innerHTML = link
        var div = document.querySelector('div')
        // add the success message and image link to the index.html
        div.insertBefore(successMessage, div.firstChild)
        imageATag.appendChild(imageLink)
      }
    }
    // open the POST request
    xhttp.open('POST', '/file_submitted', true)
    // send the formData
    xhttp.send(formData)
  }

  return {
    // make your functions available to your index.html
    saveFile,
    submitFile
  }
}())
```
#### You can now upload to S3 directly from your server!

### Take it for a spin

+ In your terminal run the following command to start the server:  
` node lib/index.js`

+ Navigate to localhost:8000. You should see the following screen. Click on **Choose File**:

![upload](https://cloud.githubusercontent.com/assets/12450298/18966154/0b014fae-8678-11e6-83b1-523bea2c605f.png)

+ Once you've selected a file, click the 'Submit' button:

![submit](https://cloud.githubusercontent.com/assets/12450298/18966222/5ca5687c-8678-11e6-99b0-aa798222bd80.png)

+ If your upload has been successful you should see the success message with the
link to your image. Click on the link:

![success](https://cloud.githubusercontent.com/assets/12450298/18966287/8f3a3484-8678-11e6-90e4-2c8147b4907d.png)
![click link](https://cloud.githubusercontent.com/assets/12450298/18966895/041c8e08-867b-11e6-89e0-183ff2f19cb8.png)

+ Click on the download and you should see your image:

![image](https://cloud.githubusercontent.com/assets/12450298/18966940/367afb3c-867b-11e6-8c0e-f66f505027c2.png)

+ Navigate back to your S3 bucket. You should see your image there:

![image in bucket](https://cloud.githubusercontent.com/assets/12450298/18966358/d14fa160-8678-11e6-84aa-1420b5ec6621.png)
