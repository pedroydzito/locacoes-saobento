const fs = require('fs');
let svg = fs.readFileSync('attached_assets/Pasted--svg-width-1920-height-2080-viewBox-0-0-1920-2080-fill-_1773682183677.txt', 'utf8');

// The specific dark colors used for the text "São Bento" and "Locações"
// based on inspecting the original SVG file
const textColors = ['#171F37', '#181F38', '#182039', '#1A2038', '#232439', '#242636'];

for (const color of textColors) {
  const regex = new RegExp(`fill="${color}"`, 'gi');
  svg = svg.replace(regex, 'fill="#FFFFFF"');
}

fs.writeFileSync('client/public/logo-branca.svg', svg);
console.log('Done!');
