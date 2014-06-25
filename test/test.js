var fs = require('fs'), 
    gm = require('gm').subClass({ imageMagick: true });

// console.log(__dirname);
// var filename = 'xl_example_image.png';
var filename = 'example-photo-landscape-mode.jpg';

console.log(filename);

// get the metadata for the uploaded image using identify() method
gm(filename).identify(function (err, data) {
	if(err) { 
		console.log(err);  
	}
	
	console.log(data.size);
	rotation = getRotationAngle(data);


	gm(filename)
	.rotate('black',rotation) // first arg has to be a color string.
	.resize(480)
	.quality(60)
	.write('mobile_'+filename, function (err) {
		if(err) { console.log(err);  }
		else    { console.log('mobile_ saved'); }
	})
		
	gm(filename)
	.rotate('black',rotation)
	.resize(200)
	.quality(60)
	.write('thumb_'+filename, function (err) {
		if(err) { console.log(err);  }
		else    { console.log('thumb_ saved'); }
	})

	gm('thumb_'+filename)
	.identify(function (err, data) {
		if(err) { console.log(err);  }
		else    { console.log(data.Properties['exif:Orientation']); }
	})

});

/**
 * get Orientation info from image file meta data
 * use to determine the angle (in degrees) to rotate the image
 * see: http://sylvana.net/jpegcrop/exif_orientation.html
 */
function getRotationAngle(data){
	var rotation    = 0;
	var orientation = 0;
	if(data.Properties.hasOwnProperty('exif:Orientation')){
		console.log('Orientation', data.Properties['exif:Orientation'])
		var orientation = parseInt(data.Properties['exif:Orientation'], 10);

		if(orientation === 3 || orientation === 4){
			rotation = 180;
		}
		if(orientation === 5 || orientation === 6){
			rotation = 270;
		}
		if(orientation === 7 || orientation === 8){
			rotation = 90;
		}
	}
	return rotation;
}