An investigation into the best way to upload (and re-size) images in node.js (meteor).

## Why? 

![Cave Painting](https://raw.github.com/ideaq/ideaq.github.io/master/img/cave-painting.png "Cave Painting")

People have used images to communicate since *the beginning*. <br />
http://en.wikipedia.org/wiki/A_picture_is_worth_a_thousand_words

We want to let our smart-phone empowered friends exercise their urge <br />
to ***communicate in pictures*** and thus make their lives richer.


## What?

- Upload an image (to S3) effortlessly
- Automatically re-size the image for mobile devices
- Return a link to the re-sized image.


## How?

### Using NPM Modules in Meteor

Instead of using an *untested* meteor (*wrapper*) module
I'm using https://github.com/arunoda/meteor-npm which
allows us to use the actual npm module inside meteor.

```sh
npm install -g meteor-npm
```

then create a package**s**.json file (note the **s** in package**s**)

```javascript
{
	"imagemagick": "0.1.3",
	"knox"       : "0.8.9",
	"tmp"        : "0.0.23"
}
```

Install dependencies:

```sh
mrt
```

Read more: http://meteorhacks.com/complete-npm-integration-for-meteor.html

### Uploading to S3 using AWS SDK

Before Amazon decided to support Node.js the go-to module for S3 was
Knox: https://github.com/LearnBoost/knox 

Meteor example: https://gist.github.com/dnprock/6689567
Learn from the tests: 
https://github.com/LearnBoost/knox/blob/master/test/createClient.test.js

Latest version: https://www.npmjs.org/package/knox (for your package**s**.json)

The (*Official*) Amazon Web Services (AWS) SDK 
https://github.com/aws/aws-sdk-js 

>  ***Utterly Useless***!! :-(
> http://stackoverflow.com/questions/14502143/cant-upload-images-in-nodejs-using-asw-sdk

For the latest version check: https://www.npmjs.org/package/aws-sdk

#### Notes

- Usage Examples: http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-examples.html


### Image Re-Sizing using ImageMagic

On a Mac you will need [Homebrew](http://brew.sh/) to install ImageMagic
(the *easy* & *fast* way.)

```
brew install imagemagick
```

Now **install node-imagemagick** (already done above the first time you ran `mrt`)

Usage: https://github.com/rsms/node-imagemagick 
Latest version: https://www.npmjs.org/package/imagemagick


### Temporary Folder / Files


Usage: https://github.com/raszi/node-tmp
Latest version: https://www.npmjs.org/package/tmp



## Research (*way more detail than you'll ever need*)

### Image-upload-as-a-Service Provider

- Transloadit: https://transloadit.com/ (tried it meteor doesn't like it)
Reached out to Transloadit team on twitter: 
https://twitter.com/nelsonic/status/440509092281319424
didn't get a reply. so moved on to next service.
- Filepicker.io: http://filepicker.io 
- http://www.imgix.com
- http://cloudinary.com
- http://www.blitline.com
- http://www.smartimage.com


### How are others solving the problem?

- http://stackoverflow.com/questions/19570496/how-to-upload-files-to-amazon-s3-with-meteor
- Direct browser upload (no resizing): http://stackoverflow.com/questions/19620929/direct-browser-upload-to-s3-with-meteor-jquery-and-the-aws-sdk
- http://stackoverflow.com/questions/10099202/how-would-one-handle-a-file-upload-with-meteor
- https://gist.github.com/dariocravero/3922137 (out of date!)
- (filepicker.io) http://stackoverflow.com/questions/13016382/integrating-filepicker-io-with-meteor
- http://stackoverflow.com/questions/19570496/how-to-upload-files-to-amazon-s3-with-meteor
- http://stackoverflow.com/questions/19593313/how-to-upload-images-from-filereader-to-amazon-s3-using-meteor
- S3 Upload: https://gist.github.com/dnprock/6689567
- Direct S3 Upload (no server-side): http://aws.amazon.com/articles/1434
- AWS Node SDK: https://aws.amazon.com/sdkfornodejs/

There was a suggestion to use Meteor CollectionFS: https://github.com/CollectionFS/Meteor-CollectionFS to upload/store images. 
This is a *terrible* idea because the file gets stored in MongoDB!
Not only is MongoDB storage *considerably* more expensive, its also 
*slower* than a CDN!! (If you know why this is a good idea, please tell me!)


#### Avoid Filename Collisions with Hashes

All the big players are storing files with generated names (instead of using 
the files' original name such as "photo1.jpg" thus avoiding name collisions) 
e.g:
- Twitter: https://pbs.twimg.com/media/Bht5EatIEAAuiuP.jpg
- Pinterest: http://media-cache-ak0.pinimg.com/736x/a0/f6/29/a0f6290890cb49f50263a4789a1f5321.jpg
- Facebook: https://fbcdn-sphotos-a-a.akamaihd.net/hphotos-ak-prn1/t1/66899_498231521223_6581930_n.jpg

Google is maintaining the file name and storing it in a folder:

- https://lh6.googleusercontent.com/-273qnruKEa8/Us0Xnng-KeI/AAAAAAAAAXI/WVr-OfaLRUA/w886-h589/Christmas%2Bin%2BGlenluce%2B2013_001.jpg

Should we maintain the filename?
I tend to re-name all the photos I want to be able find later.
So does giving these hash.jpg on our system loose some valuable information...?
(feedback please...!)


### Helpful Links

- http://stackoverflow.com/questions/18378809/find-absolute-base-path-of-the-project-directory-after-meteor-0-6-5
- Uploads in express: http://howtonode.org/78e21b7d5503a5b2b372f6c2a5de077a1e809267/really-simple-file-uploads
- Temporary file name: http://stackoverflow.com/questions/7055061/nodejs-temporary-file-name
- Crypto SHA1 Hash: http://stackoverflow.com/questions/6984139/how-do-get-the-sha1-hash-of-a-string-in-nodejs
- Build a Meteor "Smart Package": http://stackoverflow.com/questions/10114526/how-to-build-a-meteor-smart-package
- Unoffical Meteor FAQ: https://github.com/oortcloud/unofficial-meteor-faq
- File extension in node: http://stackoverflow.com/questions/10865347/node-js-get-file-extension
- Prevent non-image files from being uploaded: http://stackoverflow.com/questions/12303660/restricting-file-types-in-jquery-file-upload-demo
- Clear file input after upload: http://stackoverflow.com/questions/829571/clearing-an-html-file-upload-field-via-js
- Fontawesome intro video: http://youtu.be/BdyI6T-_7ts
- Meteor Fontawesome4: https://github.com/chrismbeckett/meteor-fontawesome4 (*icons*)

### History

I've *partially* "solved" this problem before: 
- https://github.com/nelsonic/node-cdn 
- https://github.com/nelsonic/imagemagic-test
- https://github.com/nelsonic/imgresizer

I need to re-visit these and get them working together (*with tests* :-)

#### Popular Image Web/Mobile Sites/Apps

The more successful image apps on the web/mobile:

- **Flickr** (Yahoo): http://gizmodo.com/5910223/how-yahoo-killed-flickr-and-lost-the-internet
- **Picassa** (Google): http://news.cnet.com/Google-picks-up-photo-management-firm/2100-1025_3-5267730.html 
- Imgur: http://www.businessinsider.com/imgur-and-yahoo-acquisition-talks-2013-12
- **Instagram** (Facebook): http://techcrunch.com/2012/09/06/facebook-closes-instagram-acquisition-instagram-announces-5-billion-photos-shared/
- **SnapChat** (Which Sucker?): http://mashable.com/2014/01/06/snapchat-facebook-acquisition-2

## Next

> Try: https://github.com/aheckmann/gm (instead of node-imagemagick)
