
#!/usr/bin/env node

/**
 * Script to download all ingredient images for the REGIMA CMS
 * Run with: node scripts/download-images.js
 */

async function downloadImages() {
  console.log('Starting ingredient image download...');
  
  try {
    const response = await fetch('http://localhost:5000/api/images/download-ingredient-images', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
      console.log('\n✅ Successfully downloaded images!');
      console.log(`📊 Downloaded ${Object.keys(result.urlMap).length} images`);
      console.log('📈 Statistics:', result.stats);
    } else {
      console.error('❌ Failed to download images:', result.error);
      if (result.details) {
        console.error('Details:', result.details);
      }
    }
  } catch (error) {
    console.error('❌ Error downloading images:', error.message);
    console.log('\n💡 Make sure your server is running on http://localhost:5000');
    console.log('   Start the server with: npm run dev');
  }
}

downloadImages();
