## Direct Upload Example

We are going to implement a simple solution for uploading images to an S3 bucket
via a POST request from the browser.

#### Step 1 - Creating the bucket

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

+ When you open your bucket it should be empty. We need to add some permission configuration to the bucket so that it is can be accessed remotely. Click on the
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

##### Our bucket is now completely set up so that it will accept our POST request images!

#### Step 2 - Creating an IAM user with S3 permissions

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
of these together so make a note of them! We'd recommend that you download them by clicking the button in the bottom right and storing them in a safe place

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

##### Our user is now set up with the correct permissions in order to access S3!

#### Step 3 - Upload images to S3

+ We'll be uploading our images to S3 via a simple HTTP POST request to an S3 endpoint. The request contains the following:
  + the file you wish to upload
  + the filename which is the ***key*** in S3
  + metadata
  + a *signed* **policy**

##### Policies

We mentioned some policies earlier when we were talking about our IAM user permissions. We need to attach something similar to our S3 POST request in order for it to be ***validated*** and ***accepted***. In order to generate a policy, we need to manipulate some of our AWS information (*these need to be kept secret so we'll have to create our policy on the server side*). This will provide our request with the *neccessary* credentials it needs in order to *gain access* to our S3 bucket. 

###### To generate your credentials follow these steps

+ Create a file
