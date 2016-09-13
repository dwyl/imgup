## Direct Upload Example

We are going to implement a simple solution for uploading images to an S3 bucket
via a POST request from the browser.

### Step 1 - Creating the bucket

+ Create an S3 bucket on [Amazon Web Services](aws.amazon.co.uk). To do so you'll need to
create an account if you haven't got one already.

![sign up](https://cloud.githubusercontent.com/assets/12450298/18392395/86991fb8-76a9-11e6-83d8-f16d7751b41d.png)

+ Navigate to the S3 console

![s3 console](https://cloud.githubusercontent.com/assets/12450298/18392576/34193ad8-76aa-11e6-8e2b-37cf57e11078.png)

+ Click the 'Create Bucket' button in the top left

![create bucket](https://cloud.githubusercontent.com/assets/12450298/18392672/8d5a14be-76aa-11e6-896b-e31dd4f9c1f7.png)

+ Enter your bucket name and the region you wish to create the bucket under

![region](https://cloud.githubusercontent.com/assets/12450298/18393367/f65abc0a-76ac-11e6-9242-67209b9e8802.png)

+ Your bucket should now appear in your list of buckets. Click on it

![bucket created](https://cloud.githubusercontent.com/assets/12450298/18393331/db497442-76ac-11e6-90e4-08aa31d8d53b.png)

+ When you open your bucket it should be empty. We need to add some permission
configuration to the bucket so that it is can be accessed remotely. Click on the
properties tab in the top right

![properties](https://cloud.githubusercontent.com/assets/12450298/18393302/bd0fcfd0-76ac-11e6-90a3-7a3d12705470.png)

+ Click on the ***Permissions*** tab on the right hand side and then click on the
'+ Add more permissions' button.

![add more permissions](https://cloud.githubusercontent.com/assets/12450298/18393713/64bde9be-76ae-11e6-81e1-c6f7e90811a3.png)

+ Add the word 'Everyone' to your ***Grantee*** input box and then check all of
the check boxes. Then press ***save***

![grantee](https://cloud.githubusercontent.com/assets/12450298/18393684/3f83b17e-76ae-11e6-830c-de9010469e2b.png)

+ Click on the '+ Add CORS Configuration' button in the same tab. Then enter the
following into the CORS field

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

+ Then click ***save***

![save CORS](https://cloud.githubusercontent.com/assets/12450298/18393882/359e3bf6-76af-11e6-90da-bcd993d035ff.png)

#### Our bucket is now completely set up so that it will accept our POST request images!

### Step 2 - Creating an IAM user with S3 permissions

+ Navigate to the IAM console. This is where you can create users and give them
permissions to access certain AWS services by attaching the relevant policies.

![iam console](https://cloud.githubusercontent.com/assets/12450298/18394421/ddd725f6-76b1-11e6-8688-ef9b8e4029b6.png)

+ Click on the ***Users*** tab on the left

![users](https://cloud.githubusercontent.com/assets/12450298/18394479/1c9fd31e-76b2-11e6-90e2-84b138e53596.png)

+ Click on the ***Create New Users*** button

![create new users](https://cloud.githubusercontent.com/assets/12450298/18394551/6d5ba9b8-76b2-11e6-87a6-5f818368743c.png)

+ Type the name of the user into an empty field and ensure that the 'Generate an
access key for each user' check box is selected. Then click ***Create***

![create user](https://cloud.githubusercontent.com/assets/12450298/18394660/d832c424-76b2-11e6-9a2f-05c0d820fe3d.png)

+ It should say that your new user has been created. Click on the 'Show User Security
Credentials' to view your keys. This is the only time you'll be able to see both
of these together so make a note of them! We'd recommend that you download them by
clicking the button in the bottom right and storing them in a safe place

![save credentials](https://cloud.githubusercontent.com/assets/12450298/18394743/5a549cac-76b3-11e6-9bba-dff5d8f3409c.png)

+ Navigate back to the IAM console and then select the 'Policies' tab on the left

![iam policies](https://cloud.githubusercontent.com/assets/12450298/18394896/fe61d62a-76b3-11e6-8e54-bd66bc13bb3f.png)

+ Here we can create a policy that we can then attach to our newly created user
so that they can have access to S3 services

![create policy](https://cloud.githubusercontent.com/assets/12450298/18394990/5f33f3f2-76b4-11e6-914e-443f894c817f.png)

+ Click on the ***Create Your Own Policy*** 'select' button because we are going
to create a minimal-privilege policy for our user

![custom policy](https://cloud.githubusercontent.com/assets/12450298/18395067/be5ede32-76b4-11e6-817d-1d3a920e6862.png)

+ Add the following policy giving it a descriptive name and a descrition that tells
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

![s3 policy](https://cloud.githubusercontent.com/assets/12450298/18395222/92b51d0e-76b5-11e6-931f-e77956440781.png)

+ You should receive a message saying that your policy has been successfully
created

![success](https://cloud.githubusercontent.com/assets/12450298/18395473/506be288-76b6-11e6-9c20-886697427e3d.png)

+ Now we have to attach the policy to our user. Go to the user tab again and then
click on the user that we created earlier. Then click on the ***Attach Policy***
button

![attach policy](https://cloud.githubusercontent.com/assets/12450298/18395513/918334a6-76b6-11e6-8eda-1a7b0ed328c2.png)

+ Search for the policy we created, select it and then press the ***Attach Policy***
button

![attach s3 policy](https://cloud.githubusercontent.com/assets/12450298/18395587/ea2db4b4-76b6-11e6-9ab1-64ddc924de40.png)

+ You should then be able to see it in your user's list of policies

![user policies](https://cloud.githubusercontent.com/assets/12450298/18395646/33a6a7f4-76b7-11e6-9efa-6b1849c8b6b6.png)

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

`$ npm install hapi --save`

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
access key that you saved when you created your user*):

```
export S3_ACCESS_KEY=[your_iam_user_access_key]
export S3_SECRET_KEY=[your_iam_user_secret_key]
export S3_BUCKET=[your_bucket_name]
export S3_REGION=[the_region_you_created_your_bucket_in]
```

```js
var s3Config = {
  accessKey: process.env.S3_ACCESS_KEY,
  secretKey: process.env.S3_SECRET_KEY,
  bucket: process.env.S3_BUCKET,
  region: process.env.S3_REGION,
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
        var filename =
        crypto.randomBytes(8).toString('hex') +
        path.extname(request.query.filename)
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
        path: __dirname + '/public',
        listing: false,
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
  console.log(`✅ Server running at: ${server.info.uri}`)
```
#### We now have a server that can our index.html can communicate with!

### Step 5 - Write the client side code to send our requests to the backend and to S3
