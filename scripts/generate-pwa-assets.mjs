import sharp from 'sharp';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const publicDir = path.join(projectRoot, 'public');
const pwaDir = path.join(publicDir, 'pwa');

await fs.ensureDir(pwaDir);

const colors = {
  primary: '#3b82f6',
  primaryDark: '#2563eb',
};

const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
const lightLogoPath = path.join(publicDir, 'doofs.tech-lightmode-logo.png');

console.log('🎨 Generating PWA Assets...\n');

// Generate icons
if (!fs.existsSync(lightLogoPath)) {
  console.warn('Logo not found, creating gradient icons\n');
  
  for (const size of iconSizes) {
    const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g"><stop offset="0%" stop-color="#3b82f6"/><stop offset="100%" stop-color="#2563eb"/></linearGradient></defs><rect width="${size}" height="${size}" fill="url(#g)"/><text x="${size/2}" y="${size/2 + size/8}" font-size="${size * 0.5}" font-weight="bold" fill="white" text-anchor="middle" font-family="Arial">d</text></svg>`;
    
    try {
      await sharp(Buffer.from(svg)).png().toFile(path.join(pwaDir, `icon-${size}x${size}.png`));
      console.log(`✅ icon-${size}x${size}.png`);
    } catch (e) {
      console.error(`❌ icon-${size}x${size}.png:`, e.message.split('\n')[0]);
    }
  }
} else {
  console.log('Using source logo\n');
  
  for (const size of iconSizes) {
    const padding = Math.floor(size * 0.2);
    const contentSize = size - padding * 2;
    
    try {
      await sharp(lightLogoPath)
        .resize(contentSize, contentSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
        .extend({ top: padding, bottom: padding, left: padding, right: padding, background: { r: 59, g: 130, b: 246, alpha: 1 } })
        .png()
        .toFile(path.join(pwaDir, `icon-${size}x${size}.png`));
      console.log(`✅ icon-${size}x${size}.png`);
    } catch (e) {
      console.error(`❌ icon-${size}x${size}.png:`, e.message.split('\n')[0]);
    }
  }
}

// Generate screenshots
console.log('\n📸 Generating screenshots...\n');

const wideSvg = `<svg width="1280" height="720" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g"><stop offset="0%" stop-color="#3b82f6"/><stop offset="100%" stop-color="#2563eb"/></linearGradient></defs><rect width="1280" height="720" fill="white"/><rect height="120" width="1280" fill="url(#g)"/><text x="640" y="75" font-size="64" font-weight="bold" fill="white" text-anchor="middle" font-family="Arial">doofs</text><text x="100" y="250" font-size="32" font-weight="bold" fill="#1f2937" font-family="Arial">Free Subdomains</text><text x="100" y="300" font-size="18" fill="#6b7280" font-family="Arial">Get your domain instantly with DNS control</text><text x="100" y="400" font-size="16" fill="#374151" font-family="Arial">✓ No credit card</text><text x="100" y="450" font-size="16" fill="#374151" font-family="Arial">✓ DNS management</text><text x="100" y="500" font-size="16" fill="#374151" font-family="Arial">✓ Works offline</text></svg>`;

const narrowSvg = `<svg width="750" height="1334" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g"><stop offset="0%" stop-color="#3b82f6"/><stop offset="100%" stop-color="#2563eb"/></linearGradient></defs><rect width="750" height="1334" fill="white"/><rect y="40" height="140" width="750" fill="url(#g)"/><text x="375" y="140" font-size="52" font-weight="bold" fill="white" text-anchor="middle" font-family="Arial">doofs</text><text x="60" y="300" font-size="28" font-weight="bold" fill="#1f2937" font-family="Arial">Free Subdomains</text><text x="60" y="360" font-size="16" fill="#6b7280" font-family="Arial">Claim your domain instantly</text><text x="60" y="500" font-size="16" fill="#374151" font-family="Arial">✓ No credit card</text><text x="60" y="560" font-size="16" fill="#374151" font-family="Arial">✓ DNS control</text><text x="60" y="620" font-size="16" fill="#374151" font-family="Arial">✓ Works offline</text><rect x="60" y="1100" width="630" height="80" rx="12" fill="#3b82f6"/><text x="375" y="1155" font-size="24" font-weight="bold" fill="white" text-anchor="middle" font-family="Arial">Install App</text></svg>`;

try {
  await sharp(Buffer.from(wideSvg)).png().toFile(path.join(pwaDir, 'screenshot-wide.png'));
  console.log('✅ screenshot-wide.png (1280x720)');
} catch (e) {
  console.error('❌ screenshot-wide.png:', e.message.split('\n')[0]);
}

try {
  await sharp(Buffer.from(narrowSvg)).png().toFile(path.join(pwaDir, 'screenshot-narrow.png'));
  console.log('✅ screenshot-narrow.png (750x1334)');
} catch (e) {
  console.error('❌ screenshot-narrow.png:', e.message.split('\n')[0]);
}

console.log('\n✨ Assets ready! Saved to public/pwa/');
