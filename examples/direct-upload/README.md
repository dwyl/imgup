## Direct Upload Example

We want to upload images to an S3 bucket via an html form.

html form -

      <input type="hidden" name="key" value="uploads/${filename}">
      <input type="hidden" name="AWSAccessKeyId" value="YOUR_AWS_ACCESS_KEY">
      <input type="hidden" name="acl" value="private">
      <input type="hidden" name="success_action_redirect" value="http://localhost/">
      <input type="hidden" name="policy" value="YOUR_POLICY_DOCUMENT_BASE64_ENCODED">
      <input type="hidden" name="signature" value="YOUR_CALCULATED_SIGNATURE">
      <input type="hidden" name="Content-Type" value="image/jpeg">
      <!-- Include any additional input fields here -->

The html form needs to have a meta tag in the head that takes the following to
let the browser know that you're using UTF-8 unicode character encoding:

```html
<meta http-equiv="content-type" content="text/html" charset="utf-8" />
```

The form needs to send certain information to S3 before the upload can be accepted.
If any information is excluded or incorrect the upload will be rejected.

+ #### Step 1:
Assign the action of your form to the bucket URL you want to upload to.
If you're new to Amazon Web Services, you'll first have to create an account on the
[Amazon Developer Console](aws.amazon.co.uk) Navigate to the S3 console and create
your first bucket. To access the bucket URL simply use this format with your
bucket name `https://[your-bucket-name].s3.amazonaws.com/`. Alternatively you can
include the region explicitly but AWS http://bucket.s3-aws-region.amazonaws.com
will be able to find it from the bucket name automatically.

```html
<body>
  <form action="https://[your-bucket-name].s3.amazonaws.com/" method="post" enctype="multipart/form-data">
```

+ #### Step 2:
Next you'll want to add the input information that will be sent to AWS in your form.
There are 7 that you need to add. They are:

```html
  /* this is the path to the file you wish to upload */
  <input type="hidden" name="key" value=`uploads/${filename}`>
  /* this is your AWS access key ID - [Find your key](http://amzn.to/1sT9aw0)*/
  <input type="hidden" name="AWSAccessKeyId" value="YOUR_AWS_ACCESS_KEY">
  /* set the access control policy public or private */
  <input type="hidden" name="acl" value="private">
  /* choose where you want to be redirected after successful upload */
  <input type="hidden" name="success_action_redirect" value="http://localhost/">
  /* add a policy to authorise the form */
  <input type="hidden" name="policy" value="YOUR_POLICY_DOCUMENT_BASE64_ENCODED">
  /* a signature that validates the form and that only you have created it */
  <input type="hidden" name="signature" value="YOUR_CALCULATED_SIGNATURE">
  /* this is the content type that will be applied to the uploaded files */
  <input type="hidden" name="Content-Type" value="image/jpeg">
```
