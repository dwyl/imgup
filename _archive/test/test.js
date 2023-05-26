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
	var rotated = 'rotated_'+filename; 

	gm(filename).rotate('black',rotation) // first arg has to be a color string.
	.write(rotated, function (err) {
		if(err) { console.log(err);  }
		else    { console.log(rotated+' saved'); }
		gm(rotated)
		.resize(480)
		.quality(60)
		.write('mobile_'+rotated, function (err) {
			if(err) { console.log(err);  }
			else    { console.log('mobile_ saved'); }
		});
			
		gm(rotated)
		.resize(200)
		.quality(60)
		.write('thumb_'+rotated, function (err) {
			if(err) { console.log(err);  }
			else    { console.log('thumb_ saved'); }
			gm('thumb_'+rotated)
			.identify(function (err, data) {
				if(err) { console.log(err);  }
				else    { console.log(data.Properties['exif:Orientation']); }
			});
		});
	});
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
		orientation = parseInt(data.Properties['exif:Orientation'], 10);
		console.log('Orientation:', orientation);
		
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