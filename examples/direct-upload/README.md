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
the check boxes. Then press save

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

+ Then click save

![save CORS](https://cloud.githubusercontent.com/assets/12450298/18393882/359e3bf6-76af-11e6-90da-bcd993d035ff.png)

### Our bucket is now completely set up so that it will accept our POST request images!
