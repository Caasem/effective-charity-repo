const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
const manifestLink = '<link rel="manifest" href="/manifest.json">';

if (!fs.existsSync(indexPath)) {
  throw new Error(`Expo export not found at ${indexPath}`);
}

const html = fs.readFileSync(indexPath, 'utf8');
if (!html.includes(manifestLink)) {
  fs.writeFileSync(indexPath, html.replace('</head>', `  ${manifestLink}\n</head>`));
}
