const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Minimal valid transparent 1x1 PNG expanded or simple SVG/PNG placeholder
// Standard 1x1 RGBA PNG buffer
const minimalPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64"
);

fs.writeFileSync(path.join(assetsDir, 'icon16.png'), minimalPng);
fs.writeFileSync(path.join(assetsDir, 'icon48.png'), minimalPng);
fs.writeFileSync(path.join(assetsDir, 'icon128.png'), minimalPng);

console.log("Extension icon assets generated successfully in assets/");
