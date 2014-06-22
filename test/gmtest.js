var fs = require('fs'), 
    gm = require('gm');

// console.log(gm);
// resize and remove EXIF profile data
// gm('./gym-log-landscape.jpg')
// .resize(240, 240)
// // .noProfile()
// .write('./resize.jpg', function (err) {
//   if (!err) console.log('done');
//   console.log('it worked?')
// });
console.log(__dirname);

gm(__dirname+'gym-log-landscape.jpg')
.identify(function (err, data) {
  if (!err) console.log(data)
});