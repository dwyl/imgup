var fs = require('fs'), 
    gm = require('gm').subClass({ imageMagick: true });

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

var filename = 'gym-log-landscape.jpg';

// fs.readFile(filename, function(err, data){
// 	if(err) { console.log(err); }
// 	else { console.log(data); }
// })
console.log(filename);
gm(filename)
.identify(function (err, data) {
	if(err) { console.log(err);  }
	else    { console.log(data); }
});