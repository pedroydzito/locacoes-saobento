const fs = require('fs');

// Create the white logo by doing a direct replace of the specific color codes
// used for the text paths in the original SVG
let svg = fs.readFileSync('attached_assets/Pasted--svg-width-1920-height-2080-viewBox-0-0-1920-2080-fill-_1773682183677.txt', 'utf8');

// The main text color is #171F37, but let's replace all the very dark blues
// just in case they're part of the text outline or something similar
const darkColorsToReplace = [
  '#171F37', '#181F38', '#182039', '#1A2038', 
  '#1C6087', '#1D5F86', '#1D6187', '#1E6084', '#1E6086',
  '#20607B', '#206184', '#206185', '#216185', 
  '#232439', '#242636'
];

for (const color of darkColorsToReplace) {
  // Replace all instances ignoring case
  const regex = new RegExp(`fill="${color}"`, 'gi');
  svg = svg.replace(regex, 'fill="#FFFFFF"');
}

fs.writeFileSync('client/public/logo-branca2.svg', svg);
console.log('Final SVG fix applied!');
