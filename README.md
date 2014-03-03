An investigation into the best way to upload (and re-size) images in node.js (meteor).

## Why? 

![Cave Painting](https://raw.github.com/ideaq/ideaq.github.io/master/img/cave-painting.png "Cave Painting")

http://en.wikipedia.org/wiki/A_picture_is_worth_a_thousand_words
People have used images to communicate since *the beginning*.

And the *trend* is not likely to decelerate any time soon.

- **Flickr** (Yahoo): http://gizmodo.com/5910223/how-yahoo-killed-flickr-and-lost-the-internet
- **Picassa** (Google): http://news.cnet.com/Google-picks-up-photo-management-firm/2100-1025_3-5267730.html 
- **Instagram** (Facebook): http://techcrunch.com/2012/09/06/facebook-closes-instagram-acquisition-instagram-announces-5-billion-photos-shared/
- **SnapChat** (Which Sucker?): http://mashable.com/2014/01/06/snapchat-facebook-acquisition-2

## What?

- Upload an image (to S3) quickly and easily
- Automatically re-size the image for mobile devices
- Return a link to the re-sized image.


## Research

### Image-upload-as-a-Service Provider

- Transloadit: https://transloadit.com/


### How are others solving the problem?

- http://stackoverflow.com/questions/19570496/how-to-upload-files-to-amazon-s3-with-meteor
- http://stackoverflow.com/questions/19620929/direct-browser-upload-to-s3-with-meteor-jquery-and-the-aws-sdk
- 

### History

I've *partially* "solved" this problem before: 
https://github.com/nelsonic/node-cdn but we need to re-size the images to save storage/bandwidth.
