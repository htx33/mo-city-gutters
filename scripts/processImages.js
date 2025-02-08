const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const convert = require('heic-convert');

const sourceDir = path.join(__dirname, '..', 'images', 'gutter pics');
const targetDir = path.join(__dirname, '..', 'public', 'images', 'gallery');
const categories = ['before', 'after'];

async function ensureDirectories() {
    // Create gallery directory
    await fs.mkdir(path.join(__dirname, '..', 'public', 'images', 'gallery'), { recursive: true });
    
    // Create category directories
    for (const category of categories) {
        await fs.mkdir(path.join(__dirname, '..', 'public', 'images', 'gallery', category), { recursive: true });
    }
}

async function convertHeicToJpg(inputBuffer) {
    try {
        const jpgBuffer = await convert({
            buffer: inputBuffer,
            format: 'JPEG',
            quality: 0.85
        });
        return jpgBuffer;
    } catch (error) {
        console.error('Error converting HEIC to JPG:', error);
        return null;
    }
}

async function processImage(filePath, targetPath) {
    try {
        const fileBuffer = await fs.readFile(filePath);
        let processableBuffer = fileBuffer;

        // If it's a HEIC file, convert it first
        if (path.extname(filePath).toLowerCase() === '.heic') {
            processableBuffer = await convertHeicToJpg(fileBuffer);
            if (!processableBuffer) {
                console.error('Failed to convert HEIC file:', filePath);
                return;
            }
        }

        // Process with sharp
        await sharp(processableBuffer)
            .resize(800, 600, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({ quality: 85 })
            .toFile(targetPath);

        console.log('Processed:', path.basename(filePath));
    } catch (error) {
        console.error('Error processing file:', filePath, error);
    }
}

async function processAllImages() {
    try {
        // Ensure directories exist
        await ensureDirectories();

        // Read all files from source directory
        const files = await fs.readdir(sourceDir);

        // Process each file
        for (const file of files) {
            const filePath = path.join(sourceDir, file);
            const stats = await fs.stat(filePath);

            if (stats.isFile()) {
                const ext = path.extname(file).toLowerCase();
                if (['.heic', '.jpg', '.jpeg', '.png'].includes(ext)) {
                    // Determine category (before/after) based on filename or directory
                    const category = file.toLowerCase().includes('before') ? 'before' : 'after';
                    const newFileName = path.basename(file, ext) + '.jpg';
                    const targetPath = path.join(targetDir, category, newFileName);
                    
                    await processImage(filePath, targetPath);
                }
            }
        }

        console.log('Image processing complete!');
    } catch (error) {
        console.error('Error processing images:', error);
    }
}

// Run the script
processAllImages();
