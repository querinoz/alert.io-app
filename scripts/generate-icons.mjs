import sharp from 'sharp';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const assetsDir = join(__dirname, '..', 'assets');

function radarSvg(size, padding = 0) {
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const r = (s / 2) - padding;
  const sc = (v) => v * r / 22;

  return `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="#0F1520"/>
      <stop offset="100%" stop-color="#080A10"/>
    </radialGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#00FF88" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#00FF88" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Background -->
  <rect width="${s}" height="${s}" rx="${s * 0.22}" fill="url(#bg)"/>

  <!-- Glow center -->
  <circle cx="${cx}" cy="${cy}" r="${sc(18)}" fill="url(#glow)"/>

  <!-- Rings -->
  <circle cx="${cx}" cy="${cy}" r="${sc(20)}" stroke="#00FF88" stroke-width="${Math.max(1, s/200)}" opacity="0.12" fill="none" stroke-dasharray="${sc(2.5)} ${sc(3.5)}"/>
  <circle cx="${cx}" cy="${cy}" r="${sc(16)}" stroke="#00FF88" stroke-width="${Math.max(1, s/180)}" opacity="0.2" fill="none"/>
  <circle cx="${cx}" cy="${cy}" r="${sc(11)}" stroke="#00FF88" stroke-width="${Math.max(1.2, s/150)}" opacity="0.32" fill="none"/>
  <circle cx="${cx}" cy="${cy}" r="${sc(6.5)}" stroke="#00FF88" stroke-width="${Math.max(1.2, s/140)}" opacity="0.5" fill="none"/>

  <!-- Crosshairs -->
  <line x1="${cx}" y1="${cy - sc(20)}" x2="${cx}" y2="${cy - sc(17)}" stroke="#00FF88" stroke-width="${Math.max(0.8, s/250)}" stroke-linecap="round" opacity="0.35"/>
  <line x1="${cx}" y1="${cy + sc(17)}" x2="${cx}" y2="${cy + sc(20)}" stroke="#00FF88" stroke-width="${Math.max(0.8, s/250)}" stroke-linecap="round" opacity="0.35"/>
  <line x1="${cx - sc(20)}" y1="${cy}" x2="${cx - sc(17)}" y2="${cy}" stroke="#00FF88" stroke-width="${Math.max(0.8, s/250)}" stroke-linecap="round" opacity="0.35"/>
  <line x1="${cx + sc(17)}" y1="${cy}" x2="${cx + sc(20)}" y2="${cy}" stroke="#00FF88" stroke-width="${Math.max(0.8, s/250)}" stroke-linecap="round" opacity="0.35"/>

  <!-- Sweep wedge -->
  <path d="M ${cx} ${cy} L ${cx + sc(14)} ${cy - sc(10)} A ${sc(17)} ${sc(17)} 0 0 0 ${cx + sc(5)} ${cy - sc(16.5)} Z"
    fill="#00FF88" opacity="0.12"/>

  <!-- Sweep line -->
  <line x1="${cx}" y1="${cy}" x2="${cx + sc(15)}" y2="${cy - sc(13)}"
    stroke="#00FF88" stroke-width="${Math.max(2, s/100)}" stroke-linecap="round" opacity="0.8"/>

  <!-- Blips -->
  <circle cx="${cx - sc(8)}" cy="${cy - sc(6)}" r="${sc(1.4)}" fill="#00FF88" opacity="0.6"/>
  <circle cx="${cx + sc(5)}" cy="${cy + sc(9)}" r="${sc(1)}" fill="#00FF88" opacity="0.4"/>
  <circle cx="${cx + sc(12)}" cy="${cy - sc(2)}" r="${sc(0.8)}" fill="#00FF88" opacity="0.3"/>

  <!-- Center dot with glow -->
  <circle cx="${cx}" cy="${cy}" r="${sc(4)}" fill="#00FF88" opacity="0.08"/>
  <circle cx="${cx}" cy="${cy}" r="${sc(2.8)}" fill="#00FF88" opacity="0.9"/>
</svg>`;
}

async function generate() {
  console.log('Generating app icons...');

  // icon.png - 1024x1024
  await sharp(Buffer.from(radarSvg(1024, 80)))
    .png().toFile(join(assetsDir, 'icon.png'));
  console.log('  icon.png (1024x1024)');

  // adaptive-icon.png - 1024x1024 (Android, more padding)
  await sharp(Buffer.from(radarSvg(1024, 160)))
    .png().toFile(join(assetsDir, 'adaptive-icon.png'));
  console.log('  adaptive-icon.png (1024x1024)');

  // favicon.png - 48x48
  await sharp(Buffer.from(radarSvg(192, 16)))
    .resize(48, 48)
    .png().toFile(join(assetsDir, 'favicon.png'));
  console.log('  favicon.png (48x48)');

  // splash-icon.png - 512x512
  await sharp(Buffer.from(radarSvg(512, 40)))
    .png().toFile(join(assetsDir, 'splash-icon.png'));
  console.log('  splash-icon.png (512x512)');

  console.log('Done!');
}

generate().catch(console.error);
