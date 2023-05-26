# Direct Upload to S3 - A Complete Guide

We are going to implement a simple solution for uploading images to an S3 bucket
via a POST request from the browser.

![upload example](https://cloud.githubusercontent.com/assets/12450298/18589369/593617dc-7c22-11e6-899d-00ffdc15ac73.png)

### Contents
- [Creating an S3 Bucket](#step-1---creating-the-bucket)
- [Creating IAM User with S3 Permissions](#step-2---creating-an-iam-user-with-s3-permissions)
- [Generate a Signed S3 Policy](#step-3---generate-a-signed-s3-policy)
- [Create a Server](#step-4---create-a-server-to-facilitate-the-credential-creation)
- [Server and S3 Requests](#step-5---write-the-client-side-code-to-send-our-requests-to-the-backend-and-then-to-s3)
- [Take it for a Spin](#take-it-for-a-spin)
- [Testing](#testing)
- [Learning Resources](#learning-resources)

### Step 1 - Creating the bucket

+ Create an S3 bucket on [Amazon Web Services](aws.amazon.co.uk). To do so you'll need to create an account if you haven't got one already.

![sign up](https://cloud.githubusercontent.com/assets/12450298/18392395/86991fb8-76a9-11e6-83d8-f16d7751b41d.png)

+ Navigate to the S3 console

![s3 console](https://cloud.githubusercontent.com/assets/12450298/18392576/34193ad8-76aa-11e6-8e2b-37cf57e11078.png)

+ Click the 'Create Bucket' button in the top left

![create bucket](https://cloud.githubusercontent.com/assets/12450298/18392672/8d5a14be-76aa-11e6-896b-e31dd4f9c1f7.png)

+ Enter your bucket name and the region you wish to create the bucket under. Then
click next past the 'Configure options' page.

![name and region](https://user-images.githubusercontent.com/16775804/47728474-52d83780-dc56-11e8-8f0b-a5cf98fccefc.png)

+ On the 'Set your permissions' page grant public read access under 'Manage public permissions' and grant write access under 'Manage system permissions'.

![permissions](https://user-images.githubusercontent.com/16775804/47728326-0987e800-dc56-11e8-90f4-767a452dd440.png)

+ Your review screen should now look like this:

![review](https://user-images.githubusercontent.com/16775804/47728576-87e48a00-dc56-11e8-8f04-f549637520b4.png)

+ Your bucket should now appear in your list of buckets. Click on it

![bucket created](https://user-images.githubusercontent.com/16775804/47728698-c417ea80-dc56-11e8-9d05-b2eca2fcfca4.png)

+ When you open your bucket it should be empty. We need to add some permission
configuration to the bucket so that it is can be accessed remotely. Click on the
***Permissions*** tab and then on 'CORS configuration'

![permissions](https://user-images.githubusercontent.com/16775804/47731648-6f776e00-dc5c-11e8-996b-223fc9562f9b.png)

+ Then enter paste the following into the CORS configuration editor:

```
<?xml version="1.0" encoding="UTF-8"?>
<CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
    <CORSRule>
        <AllowedOrigin>*</AllowedOrigin>
        <AllowedMethod>GET</AllowedMethod>
        <AllowedMethod>POST</AllowedMethod>
        <AllowedMethod>PUT</AllowedMethod>
        <AllowedHeader>*</AllowedHeader>
    </CORSRule>
</CORSConfiguration>
```
(*it's basically saying that we are allowing GET,
 POST and PUT requests from any Allowed Origin with any Allowed Header*)  

+ Finally we need to add a policy to the bucket to make it public readable. It
makes the files uploaded to the bucket viewable in browsers. So click on 'Bucket Policy' and paste in the following code. Make sure you replace the `[YOUR_BUCKET_NAME]` text with the name of your bucket and then click save.

```
{
	"Version": "2008-10-17",
	"Statement": [
		{
			"Sid": "AllowPublicRead",
			"Effect": "Allow",
			"Principal": {
				"AWS": "*"
			},
			"Action": "s3:GetObject",
			"Resource": "arn:aws:s3:::[YOUR_BUCKET_NAME]/*"
		}
	]
}
```

#### Our bucket is now completely set up so that it will accept our POST request images!

### Step 2 - Creating an IAM user with S3 permissions

+ Before you set up an IAM user, you must create the permission policy that you
will give them. To do this navigate to the IAM console and then select the 'Policies' tab on the left:

![iam console](https://cloud.githubusercontent.com/assets/12450298/18394421/ddd725f6-76b1-11e6-8688-ef9b8e4029b6.png)

![iam policies](https://cloud.githubusercontent.com/assets/12450298/18394896/fe61d62a-76b3-11e6-8e54-bd66bc13bb3f.png)

+ Click on the ***Create Policy*** button because we are going to create a minimal-privilege policy for our user

![create policy](https://cloud.githubusercontent.com/assets/12450298/18394990/5f33f3f2-76b4-11e6-914e-443f894c817f.png)

+ Without editing anything on the 'Visual editor' tab go straight to the JSON tab
(this will be automatically updated by what we'll put in the JSON tab).

![Visual editor tab](https://user-images.githubusercontent.com/16775804/48076803-eb823080-e1dd-11e8-92c7-88cf85a4e804.png)

+ Add the following policy giving it a descriptive name and a description that tells
you exactly what it allows (*remember to put your bucket name in the placeholder
  in the 'Resource' section*). Then click ***Create Policy***

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:PutObjectAcl"
            ],
            "Resource": [
                "arn:aws:s3:::[YOUR_BUCKET_NAME]/*"
            ]
        }
    ]
}
```
![s3 policy](https://user-images.githubusercontent.com/16775804/48077073-782cee80-e1de-11e8-9de9-e5939c2bdfbe.png)

+ Your 'visual editor' tab should now look like this, then click ***Review policy***:

![updated visual editor](https://user-images.githubusercontent.com/16775804/48077187-b7f3d600-e1de-11e8-9a29-e6779fb17aed.png)

+ Now enter the name and a short description for your policy. Once you're done
then click ***Create policy***

![Review policy](https://user-images.githubusercontent.com/16775804/48077385-2173e480-e1df-11e8-9d4f-fdcc113134b2.png)

+ You should see a confirmation saying that your policy has been successfully
created:

![success](https://user-images.githubusercontent.com/16775804/48077552-79125000-e1df-11e8-94c4-db99433db78a.png)

+ Now we have created our policy we can create our IAM user. Navigate back to the IAM console and select the ***Users*** tab on the left. This is where you can create
users and give them permissions to access certain AWS services by attaching the relevant policies.

![users](https://cloud.githubusercontent.com/assets/12450298/18394479/1c9fd31e-76b2-11e6-90e2-84b138e53596.png)

+ Click on the ***Add user*** button

+ Enter the name of the user into the 'User name' field.

![user name](https://user-images.githubusercontent.com/16775804/48075782-dc9a7e80-e1db-11e8-8b22-4c5141dee18e.png)

+ Ensure that the 'Programmatic access' check box is selected. Then click ***Next***

![access checkbox](https://user-images.githubusercontent.com/16775804/48075861-fb991080-e1db-11e8-81a2-67a04e041c0a.png)

+ Now you need to set permissions for the user. As you've just created a policy
you should click on the ***Attach existing policies directly*** button.

+ Search for the policy you created, select it and then press ***Next***

![attach policy](https://user-images.githubusercontent.com/16775804/48077995-83811980-e1e0-11e8-8618-6ac17faeeb39.png)

+ You should then be able to see it in your user's list of policies, so now you
can click ***Create user*** to complete the process!

![user policies](https://user-images.githubusercontent.com/16775804/48078236-e672b080-e1e0-11e8-9bab-a32dae28a3d2.png)

+ It should say that your new user has been created. Click ***Show*** under
'Secret access key' to view your key. Record this as well as your 'Access key ID'.
 This is the only time you'll be able to see both of these together so make a note of them! We'd recommend that you download them by clicking the ***Download .csv*** button and storing them in a safe place.

![success](https://user-images.githubusercontent.com/16775804/48078997-63eaf080-e1e2-11e8-9ec1-d02250e349a6.png)

#### Our user is now set up with the correct permissions in order to access S3!

### Step 3 - Generate a signed S3 policy

+ We'll be uploading our images to S3 via a simple HTTP POST request to an S3 endpoint. The request contains the following:
  + the file you wish to upload
  + the filename which is the ***key*** in S3
  + metadata
  + a *signed* **policy**

##### Policies

We mentioned some policies earlier when we were talking about our IAM user permissions.
We need to attach something similar to our S3 POST request in order for it to be
***validated*** and ***accepted***. In order to generate a policy, we need to manipulate
some of our AWS information (*these need to be kept secret so we'll have to create
our policy on the server side*). This will provide our request with the *neccessary*
credentials it needs in order to *gain access* to our S3 bucket.

###### To generate your credentials follow these steps

+ Create a file called `generate-credentials.js`. This will contain the script we
will use to create our signed policy. Add the following to that file:

```js
var crypto = require('crypto')
// require the crypto module
// it provides cryptographic functionality that we need to create our signed policy
```
Let's add a function that will provide the relevant information to the frontend
when needed. We can call it `getS3Credentials`:

```js
// passes config and filename down to buildS3Params
function getS3Credentials (config, filename) {
  return {
    // this is the endpoint for our bucket
    endpoint_url: "https://" + config.bucket + ".s3.amazonaws.com",
    // these are the params needed to upload to S3
    params: buildS3Params(config, filename)
  }
}
```
The `buildS3Params` function will construct the neccessary params needed to make
the API call to S3:

```js
/**
* Returns S3 upload params
* @param {Object} config - access key, secret key, bucket name, region
* @param {string} filename - name of the file to be uploaded
**/
function buildS3Params (config, filename) {
  // formats the amz credential correctly
  var credential = formatAmzCredential(config);
  // creates the upload policy needed for S3
  var policy = buildS3UploadPolicy(config, filename, credential);
  // converts the policy to base64 format
  var policyBase64 = new Buffer(JSON.stringify(policy)).toString('base64');
  return {
    key: filename,
    acl: 'public-read',
    success_action_status: '201',
    policy: policyBase64,
    'x-amz-algorithm': 'AWS4-HMAC-SHA256',
    'x-amz-credential': credential,
    'x-amz-date': dateString() + 'T000000Z',
    'x-amz-signature': buildS3UploadSignature(config, policyBase64, credential)
  }
}
```
The `formatAmzCredential` function takes the config and returns a formatted amz
credential:

```js
/**
* Returns a formatted amz credential string
* @param {Object} config - access key, region
**/
function formatAmzCredential (config) {
  return [config.accessKey, dateString(), config.region, 's3/aws4_request'].join('/')
}
```

The `buildS3UploadPolicy` function constructs the policy that we need to attach
to the S3 params:

```js
/**
* Returns the S3 upload policy object
* @param {Object} config - bucket name
* @param {string} filename - name of the file to be uploaded
* @param {string} credential - formatted amz credential
**/
function buildS3UploadPolicy (config, filename, credential) {
  return {
    // we want the policy to expire 3 minutes after it was created
    expiration: new Date((new Date).getTime() + (3 * 60 * 1000)).toISOString(),
    conditions: [
      { bucket: config.bucket },
      { key: filename },
      { acl: 'public-read' },
      { success_action_status: "201" },
      // size range of the image to be uploaded (in bytes)
      ['content-length-range', 0, 1000000],
      { 'x-amz-algorithm': 'AWS4-HMAC-SHA256' },
      { 'x-amz-credential': credential },
      { 'x-amz-date': dateString() + 'T000000Z' }
    ],
  }
}
```
The `dateString` function formats the date for the policy in the way that S3 is
expecting it:

```js
function dateString () {
  var date = new Date().toISOString()
  return date.substr(0, 4) + date.substr(5, 2) + date.substr(8, 2)
}
```

The `buildS3UploadSignature` function creates a hash that is used to sign our policy
(see the [*calculating a signature*](http://docs.aws.amazon.com/AmazonS3/latest/API/sigv4-authentication-HTTPPOST.html)
diagram in the AWS documentation):

```js
/**
* Returns an HMAC hex hash signature
* @param {Object} config - secret key, region
* @param {string} policyBase64 - encoded policy string
* @param {string} credential - formatted amz credential
**/
function buildS3UploadSignature (config, policyBase64, credential) {
  var dateKey = hmac('AWS4' + config.secretKey, dateString())
  var dateRegionKey = hmac(dateKey, config.region)
  var dateRegionServiceKey = hmac(dateRegionKey, 's3')
  var signingKey = hmac(dateRegionServiceKey, 'aws4_request')
  // note that only the returned string is converted to hex format
  return hmac(signingKey, policyBase64).toString('hex')
}
```

The `hmac` function is a helper function used to build HMAC encoded strings:

```js
/**
* Returns an HMAC of key + string
* @param {string} key
* @param {string} string
**/
function hmac (key, string) {
  var hmac = crypto.createHmac('sha256', key)
  hmac.end(string)
  return hmac.read()
}
```

Lastly we need to export our `getS3Credentials` function so that it can be used
on the backend:

```js
module.exports = {
  getS3Credentials: getS3Credentials
}
```

#### We've now created a signed policy that we can attach to our POST request!

### Step 4 - Create a server to facilitate the credential creation

+ Create a file called `server.js`. This file will serve both your application
and the generated signing key from the previous step. We're going to use [hapi.js](http://hapijs.com/)
so before we get started, run the following command in your terminal:  

`npm install hapi --save`

Next add the following to your newly created server file:

```js
// load the modules we'll be using on the server side
var Hapi = require('hapi')
// we'll be using crypto for our unique filenames
var crypto = require('crypto')
// we'll be using path for the correct file path extensions for our files
var path = require('path')
// need to load our script to generate the S3 credentials
var s3 = require('./generate-credentials')
```

Now we'll create our S3 configuration that our `getS3Credentials` function can
use. Before we do this we have to export some environment variables. Type the
following into your terminal (*you'll need your access key id and your secret
access key that you saved when you created your user*). Look up the format to
write your region key in here: https://docs.aws.amazon.com/general/latest/gr/rande.html:

```
export AWS_S3_ACCESS_KEY=[your_iam_user_access_key]
export AWS_S3_SECRET_KEY=[your_iam_user_secret_key]
export AWS_S3_BUCKET=[your_bucket_name]
export AWS_S3_REGION=[the_region_you_created_your_bucket_in]
```

```js
var s3Config = {
  accessKey: process.env.AWS_S3_ACCESS_KEY,
  secretKey: process.env.AWS_S3_SECRET_KEY,
  bucket: process.env.AWS_S3_BUCKET,
  region: process.env.AWS_S3_REGION,
}
```

Let's create our hapi server:

```js
// create the new instance
var server = new Hapi.Server()

// determine the host and port
server.connection({
  host: 'localhost',
  port: 8000
})

// in order to serve static files such as our index.html we need to require inert
server.register(require('inert'),
(err) => {
  if (err) {
    throw err
  }
})
```

Within the `server.register` function we can now declare our routes:

```js
server.register(require('inert'),
(err) => {
  if (err) {
    throw err
  }
  // serves our index.html when '/' path is requested
  server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
      reply.file('./public/index.html')
    }
  })
  // this serves our S3 credentials when the HTTP GET request is made to '/s3_credentials'
  server.route({
    method: 'GET',
    path: '/s3_credentials',
    handler: function (request, reply) {
      if (request.query.filename) {
        // if  you upload two items with the same name to the same bucket, the second
        // will overwrite the first. These random hashes prevent that from happening
        var ext = '.' + path.extname(request.query.filename)
        var filename = request.query.filename.replace(ext, '') +
          crypto.randomBytes(8).toString('hex') + ext
        reply(s3.getS3Credentials(s3Config, filename))
      } else {
        reply('Filename required')
      }
    }
  })
  // to require static files from your public folder in your index.html you will
  // need to add this route otherwise you will see a 404 error message
  server.route({
    method: 'GET',
    path: '/{filename*}',
    handler: {
      directory: {
        path: 'public',
        listing: true,
        index: false
      }
    }
  })
})

// lastly we need to start the server
server.start((err) => {
  if (err) {
    throw err
  }
  console.log(`✅ Server running at: {server.info.uri}`)
```

#### We now have a server that can our index.html can communicate with!

### Step 5 - Write the client side code to send our requests to the backend and then to S3

+ Create a `public` directory in the root of your project. Inside this new folder
create two new files `index.html` and `client.js`

Insert the following into your `index.html`:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>S3 Upload Demo</title>
    // optional stylesheet
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/flat-ui/2.2.2/css/flat-ui.min.css">
    // include your client.js file that we are going to write
    <script type="text/javascript" src="client.js"></script>
  </head>
  <body>
    <h1>S3 Direct Upload Demo</h1>
    // simple form with a file input (we'll be adding more later dynamically)
    <form>
    // onchange gets fired when a file is selected so we want to save the file
      <input id="fileInput" type="file" name="file" onchange="uploadDemo.saveFile(this.files)"/>
    </form>
    // button that will submit our file
    <button onclick="uploadDemo.submitFile()">Submit</button>
    // container for the success message and link to our image
    <div class="successMessageContainer">
      <a class="imageLink"></a>
    </div>
  </body>
</html>
```
In your `client.js` file add the following:

```js
// wrap everything in an IIFE (immediately invoked function expression) to contain
// global variables
var uploadDemo = (function () {
  // 'global' variable used to store our filename
  var filename

  /**
  * Saves the filename to our global variable when a file has been selected
  * @param {Object} file - file from our file input tag
  **/
  function saveFile (file) {
    filename = file[0].name
  }

  /**
  * Calls our getCredentialsFromServer function with the global filename
  **/
  function submitFile () {
    getCredentialsFromServer(filename)
  }

  // function that retrieves our S3 credentials from our server
  /**
  * Saves the filename to our global variable when a file has been selected
  * @param {string} filename - name of the file we want to upload
  **/
  function getCredentialsFromServer (filename) {
    var xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = function () {
      if (this.readyState === 4 && this.status === 200) {
        // after we've received a response we want to assign it to a variable
        var s3Data = JSON.parse(xhttp.responseText)
        // call our buildAndSubmitForm function
        buildAndSubmitForm(s3Data)
        // return a success message after the image has been uploaded along with
        // link to image
        var successMessage = document.createElement('h4')
        successMessage.innerHTML = 'Image Successfully Uploaded at: '
        var link = `https://<your_bucket_name>.s3.amazonaws.com/{filename}`
        var imageATag = document.querySelector('a')
        imageATag.setAttribute('href', link)
        var imageLink = document.createElement('h4')
        imageLink.innerHTML = link
        var div = document.querySelector('div')
        div.insertBefore(successMessage, div.firstChild)
        imageATag.appendChild(imageLink)
      }
    }
    // open the GET request to our endpoint with our filename attached
    xhttp.open('GET', `/s3_credentials?filename={filename}`, true)
    // send the GET request
    xhttp.send()
  }

  /**
  * Dynamically creates and submits our form to S3
  * @param {Object} s3Data - endpoint_url and params sent back from our server
  **/
  function buildAndSubmitForm (s3Data) {
    // access the form in our index.html
    var form = document.querySelector('form')
    // create a new input element
    var keyInput = document.createElement('input')
    // set its type attribute to hidden
    keyInput.setAttribute('type', 'hidden')
    // set its name attribute to key
    keyInput.setAttribute('name', 'key')
    // set its value attribute to our filename
    keyInput.setAttribute('value', `{filename}`)
    // set the method of the form to POST
    form.setAttribute('method', 'post')
    // set the action attribute to be our endpoint_url from our server
    form.setAttribute('action', s3Data.endpoint_url)
    // set the encoding type to multipart/form-data
    form.setAttribute('enctype', 'multipart/form-data')
    // our file input **must** be the last input in the form, therefore we need
    // to insert our keyInput before the first child of the form otherwise it will
    // throw an error
    form.insertBefore(keyInput, form.firstChild)
    // set the form url to be our endpoint_url from our server
    form.url = s3Data.endpoint_url
    // set the form data to be our S3 params from our server
    form.formData = s3Data.params
    // submit the form
    form.submit()
  }
  // return functions from our IIFE that we'll need to expose to our index.html
  return {
    saveFile,
    submitFile
  }
}())
```
#### We've now written the neccessary code needed to upload directly to S3!

### Take it for a spin!

+ In your terminal run the following command to start the server:  
` node lib/index.js`

+ Navigate to localhost:8000. You should see the following screen. Click on **Choose File**:

![demo](https://cloud.githubusercontent.com/assets/12450298/18581819/27ac5dac-7bfa-11e6-987f-8aef76c7243c.png)

+ Choose the file you wish to upload and click **open**:

![choose file](https://cloud.githubusercontent.com/assets/12450298/18582392/afcb9598-7bfc-11e6-940d-9f1c85f44c67.png)

+ Then click the **Submit** button

![submit](https://cloud.githubusercontent.com/assets/12450298/18582412/d15503ca-7bfc-11e6-8bd8-52548bf29e2e.png)

+ You should then see the success message with the link to where the image is being hosted (*this can now be used as an img src*). Click on the link:

![success](https://cloud.githubusercontent.com/assets/12450298/18582441/fc24f646-7bfc-11e6-89e8-5dcdaa49ffef.png)

+ This should start an automatic download. Click on the download:

![image download](https://cloud.githubusercontent.com/assets/12450298/18582455/1f080edc-7bfd-11e6-8280-881ef2462e92.png)

+ You should see your image!
![one does not simply](https://cloud.githubusercontent.com/assets/12450298/18582475/4d75e28a-7bfd-11e6-83a0-2c7029cb9830.png)

+ Let's check our S3 console so that we know *for sure* that our image is there. Navigate back to your S3 buckets and click on the one you uploaded to:
![s3 buckets](https://cloud.githubusercontent.com/assets/12450298/18583007/098154ee-7c00-11e6-931e-4dec223cf95d.png)

+ You should be able to see the image that you just uploaded:
![image uploaded](https://cloud.githubusercontent.com/assets/12450298/18583075/5132dc9a-7c00-11e6-91f4-8e1103d3e49a.png)


# 🎉 We've successfully uploaded an image directly to S3!

### Testing

#### Front-end tests
We're using [Nightwatch](http://nightwatchjs.org/) for our front end tests.
It's a browser automated testing framework used for browser based apps and
websites.

#### Back-end tests
We're using [Tape](https://github.com/substack/tape) for our back-end tests.   

### Learning Resources

- Amazon documentation - [Browser-Based Upload using HTTP POST (Using AWS Signature Version 4)](http://docs.aws.amazon.com/AmazonS3/latest/API/sigv4-post-example.html)
- Leonid Shevtsov - [Demystifying direct uploads from the browser to Amazon S3](https://leonid.shevtsov.me/post/demystifying-s3-browser-upload/)
- Stackoverflow Q - [Amazon S3 POST api, and signing a policy with NodeJS](http://stackoverflow.com/questions/18476217/amazon-s3-post-api-and-signing-a-policy-with-nodejs)
- AWS Articles - [Browser Uploads to S3 using HTML POST Forms
](https://aws.amazon.com/articles/1434)
