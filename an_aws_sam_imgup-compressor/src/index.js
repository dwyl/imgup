const AWS = require('aws-sdk');
const S3 = new AWS.S3();
const sharp = require('sharp');

exports.handler = async (event) => {

    // Collect the object key from the S3 event record
    const { key } = event.Records[0].s3.object;

    console.log({ triggerObject: key });

    // Collect the full resolution image from s3 using the object key
    const uncompressedImage = await S3.getObject({
        Bucket: process.env.UNCOMPRESSED_BUCKET,
        Key: key,
    }).promise();

    // Compress the image to a 200x200 avatar square as a buffer, without stretching
    const compressedImageBuffer = await sharp(uncompressedImage.Body)
    .resize({ 
        height: 200, 
        fit: 'contain'
    })
    .png()
    .toBuffer();

    // Upload the compressed image buffer to the Compressed Images bucket
    await S3.putObject({
        Bucket: process.env.COMPRESSED_BUCKET,
        Key: key,
        Body: compressedImageBuffer,
        ContentType: "image/png",
        ACL: 'public-read'
    }).promise();

    console.log(`Compressing ${key} complete!`)

}