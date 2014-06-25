var fs = require('fs'), 
    gm = require('gm').subClass({ imageMagick: true });

// console.log(__dirname);
// var filename = 'xl_example_image.png';
var filename = 'example-photo-landscape-mode.jpg';

console.log(filename);
var rotation = 0;
gm(filename)
.identify(function (err, data) {
	if(err) { console.log(err);  }
	else    { console.log(data.size); }
	console.log(data.Properties['exif:Orientation'])
	var orient = parseInt(data.Properties['exif:Orientation'], 10);

	if(orient === 3 || orient === 4){
		rotation = 180;
	}
	if(orient === 5 || orient === 6){
		rotation = 270;
	}
	if(orient === 7 || orient === 8){
		rotation = 90;
	}

	gm(filename)
	.rotate('black',rotation)
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

});

