const fs = require('fs');
const { createCanvas } = require('canvas');

// Create icons at different sizes
[16, 48, 128].forEach(size => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Blue background with rounded corners
  ctx.fillStyle = '#4285F4';
  ctx.fillRect(0, 0, size, size);
  
  // Draw "AI" text
  ctx.fillStyle = 'white';
  ctx.font = `bold ${Math.floor(size * 0.5)}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('AI', size / 2, size / 2);
  
  // Save as PNG
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`icon${size}.png`, buffer);
  console.log(`Created icon${size}.png`);
});
