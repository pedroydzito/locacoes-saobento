const fs = require('fs');
let svg = fs.readFileSync('attached_assets/Pasted--svg-width-1920-height-2080-viewBox-0-0-1920-2080-fill-_1773682183677.txt', 'utf8');

// Also explicitly target the first match which is the text color path
const colorMap = {
  '#171F37': '#FFFFFF',
  '#181F38': '#FFFFFF',
  '#182039': '#FFFFFF',
  '#1A2038': '#FFFFFF',
  '#232439': '#FFFFFF',
  '#242636': '#FFFFFF',
};

// Also let's try direct color replacement using regex
svg = svg.replace(/fill="#171F37"/gi, 'fill="#FFFFFF"');
svg = svg.replace(/fill="#181F38"/gi, 'fill="#FFFFFF"');
svg = svg.replace(/fill="#182039"/gi, 'fill="#FFFFFF"');

fs.writeFileSync('client/public/logo-branca.svg', svg);
console.log('Done!');
