A solution to uploading photos with AWS Lambda

## Why?

Helping people ***communicate in pictures*** makes their lives better.

## What?

A simple image uploader module that can be included within your project.

It will:

- Upload imagess (to S3 and Google drive/photos) effortlessly
- Use **ImageMagic** to ***automatically re-size*** & *optimise* the image for mobile devices
- Return a list of the images that were uploaded to S3 for use in other objects.


### Image Re-Sizing using **gm**

**gm** depends on ImageMagick. On a Mac you will need [Homebrew](http://brew.sh/) to install ImageMagic
(the *easy* & *fast* way.)

```
brew install imagemagick
```

If you want to enable WebP support for your images, you must include the following flag in your installation command:

```
brew install imagemagick --with-webp
```

Usage: https://www.npmjs.com/package/gm

### Image Rotation

We started using this code in staging today and
users started uploading images imediately.

> "Its faster than Instagram!" ~ A User

Was a user comment that *delighted* us.

However they uploaded images from their iDevices which were not in the correct orientation...

So we need to add rotation.

#### Assumptions

Aproximately [90% of people](http://en.wikipedia.org/wiki/Handedness) are right-handed.

![iphone landscape right-handed](http://i.imgur.com/3M4PiXa.jpg)

Therefore we need to rotate images 90 degrees *clockwise*.

We'll be using **gm** for our image rotation.

#### Understanding JPEG Exif Orientation

For convenience, here is what the letter F would look like if it were tagged correctly and displayed by a program that ignores the orientation tag (thus showing the stored image):
```
  1          2         3        4         5                 6           7            8

888888    888888        88    88        8888888888    88                   88   8888888888
88            88        88    88        88  88        88  88           88  88       88  88
8888        8888      8888    8888      88            8888888888   8888888888           88
88            88        88    88
88            88    888888    888888
```

- See: Jpeg Exif Orientation http://sylvana.net/jpegcrop/exif_orientation.html for more detail


### Temporary Folder / Files


Usage: https://github.com/raszi/node-tmp <br />
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


### Troubleshooting

- If you get an **enoent error** while trying to run **gm** see:
http://stackoverflow.com/questions/16222116/error-spawn-enoent-while-using-gm-in-node

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
