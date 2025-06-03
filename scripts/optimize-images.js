#!/usr/bin/env node

/**
 * Image Optimization Script
 * 
 * This script helps optimize images in the public directory to improve page load performance.
 * It creates optimized versions of images using sharp.
 */

const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

// Configuration
const PUBLIC_DIR = path.join(__dirname, '../public');
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const SIZES = [640, 1080, 1920]; // Responsive sizes
const QUALITY = 80;

// Ensure sharp is installed
async function ensureDependencies() {
  try {
    require.resolve('sharp');
    console.log('✅ Sharp is already installed');
  } catch (e) {
    console.log('📦 Installing sharp...');
    try {
      await exec('npm install --save-dev sharp');
      console.log('✅ Sharp installed successfully');
    } catch (error) {
      console.error('❌ Failed to install sharp:', error.message);
      process.exit(1);
    }
  }
}

// Find all images in the public directory
async function findImages(dir) {
  const files = await fs.readdir(dir, { withFileTypes: true });
  let images = [];

  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      const subDirImages = await findImages(fullPath);
      images = [...images, ...subDirImages];
    } else {
      const ext = path.extname(file.name).toLowerCase();
      if (IMAGE_EXTENSIONS.includes(ext)) {
        images.push(fullPath);
      }
    }
  }
  
  return images;
}

// Optimize a single image
async function optimizeImage(imagePath) {
  const dir = path.dirname(imagePath);
  const ext = path.extname(imagePath);
  const basename = path.basename(imagePath, ext);
  
  // Create optimized directory if it doesn't exist
  const optimizedDir = path.join(dir, 'optimized');
  try {
    await fs.mkdir(optimizedDir, { recursive: true });
  } catch (err) {
    // Directory might already exist
  }
  
  // Create WebP version
  try {
    await sharp(imagePath)
      .webp({ quality: QUALITY })
      .toFile(path.join(optimizedDir, `${basename}.webp`));
    
    // Create responsive versions
    for (const width of SIZES) {
      await sharp(imagePath)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toFile(path.join(optimizedDir, `${basename}-${width}.webp`));
    }
    
    return true;
  } catch (err) {
    console.error(`❌ Failed to optimize ${imagePath}:`, err.message);
    return false;
  }
}

// Main function
async function main() {
  console.log('🔍 Starting image optimization...');
  
  try {
    await ensureDependencies();
    
    const images = await findImages(PUBLIC_DIR);
    console.log(`📷 Found ${images.length} images to optimize`);
    
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < images.length; i++) {
      const imagePath = images[i];
      console.log(`🔄 Optimizing (${i+1}/${images.length}): ${path.relative(PUBLIC_DIR, imagePath)}`);
      
      const success = await optimizeImage(imagePath);
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
    }
    
    console.log('\n🎉 Optimization complete!');
    console.log(`✅ Successfully optimized: ${successCount} images`);
    if (failCount > 0) {
      console.log(`❌ Failed to optimize: ${failCount} images`);
    }
    
    console.log('\n📝 Next steps:');
    console.log('1. Use the optimized images in your components');
    console.log('2. Update your image paths to point to the optimized versions');
    console.log('3. Consider using the OptimizedImage component with these new images');
    
  } catch (err) {
    console.error('❌ Error during optimization:', err);
  }
}

main();
