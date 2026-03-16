const fs = require('fs');

const svg = fs.readFileSync('client/public/logo-svg-dark.svg', 'utf8');

const updated = svg.replace(/fill="#([0-9a-fA-F]{6})"/gi, (match, hex) => {
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  
  // If the color is very dark (like #171F37 which is 23, 31, 55)
  if (r < 60 && g < 60 && b < 80) {
    return 'fill="#FFFFFF"';
  }
  return match;
});

fs.writeFileSync('client/public/logo-svg-dark.svg', updated);
console.log('SVG updated!');
