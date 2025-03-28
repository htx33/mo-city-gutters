const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
require('dotenv').config();

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

async function uploadFile(filePath, bucketPath) {
    const contentType = mime.lookup(filePath) || 'application/octet-stream';
    const fileContent = fs.readFileSync(filePath);
    
    try {
        await s3Client.send(new PutObjectCommand({
            Bucket: 'mo-city-gutters',
            Key: bucketPath,
            Body: fileContent,
            ContentType: contentType
        }));
        console.log(`Successfully uploaded ${bucketPath}`);
    } catch (err) {
        console.error(`Error uploading ${bucketPath}:`, err);
    }
}

async function uploadDirectory(dirPath, prefix = '') {
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
        const fullPath = path.join(dirPath, file);
        const bucketPath = prefix ? `${prefix}/${file}` : file;
        
        if (fs.statSync(fullPath).isDirectory()) {
            await uploadDirectory(fullPath, bucketPath);
        } else {
            await uploadFile(fullPath, bucketPath);
        }
    }
}

// Upload all files from the build directory
async function uploadWebsite() {
    try {
        console.log('Starting website upload...');
        await uploadDirectory(path.join(__dirname, 'build'));
        console.log('Website upload complete!');
    } catch (err) {
        console.error('Error uploading website:', err);
    }
}

uploadWebsite();
