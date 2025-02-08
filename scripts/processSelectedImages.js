const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

const sourceDir = path.join(__dirname, '..', 'images', 'gutter pics', 'Use These');
const targetDir = path.join(__dirname, '..', 'public', 'images', 'gallery');

async function ensureDirectory() {
    await fs.mkdir(targetDir, { recursive: true });
}

async function processImage(filePath, targetPath) {
    try {
        const fileBuffer = await fs.readFile(filePath);
        
        // Get image metadata
        const metadata = await sharp(fileBuffer).metadata();
        
        // Calculate dimensions based on rule of thirds
        const targetWidth = 1200;
        const targetHeight = Math.round(targetWidth * (2/3)); // 3:2 aspect ratio
        
        // Calculate crop dimensions to maintain rule of thirds
        let cropWidth = metadata.width;
        let cropHeight = Math.round(cropWidth * (2/3));
        
        if (cropHeight > metadata.height) {
            cropHeight = metadata.height;
            cropWidth = Math.round(cropHeight * (3/2));
        }
        
        // Calculate crop position to focus on the center
        const left = Math.round((metadata.width - cropWidth) / 2);
        const top = Math.round((metadata.height - cropHeight) / 2);
        
        // Process with sharp
        await sharp(fileBuffer)
            // First crop to 3:2 aspect ratio
            .extract({
                left: left,
                top: top,
                width: cropWidth,
                height: cropHeight
            })
            // Then resize to target dimensions
            .resize(targetWidth, targetHeight, {
                fit: 'fill',
                position: 'attention' // Use attention to focus on important parts
            })
            // Enhance image
            .modulate({
                brightness: 1.05,
                saturation: 1.1
            })
            .sharpen({
                sigma: 0.5,
                flat: 1,
                jagged: 2
            })
            .jpeg({
                quality: 85,
                chromaSubsampling: '4:4:4'
            })
            .toFile(targetPath);

        console.log('Processed:', path.basename(filePath));
    } catch (error) {
        console.error('Error processing file:', filePath, error);
    }
}

async function processAllImages() {
    try {
        // Ensure directory exists
        await ensureDirectory();

        // List of specific images to process
        const selectedImages = [
            'IMG_3815.JPG',
            'IMG_3895.JPG',
            'IMG_3897.JPG',
            'IMG_3902.JPG',
            'IMG_3903.JPG',
            'IMG_3907.JPG'
        ];

        // Process each selected file
        for (const filename of selectedImages) {
            const filePath = path.join(sourceDir, filename);
            const newFileName = filename.toLowerCase(); // Convert to lowercase extension
            const targetPath = path.join(targetDir, newFileName);
            
            await processImage(filePath, targetPath);
        }

        console.log('Image processing complete!');
    } catch (error) {
        console.error('Error processing images:', error);
    }
}

// Run the script
processAllImages();
