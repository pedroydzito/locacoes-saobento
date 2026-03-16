const fs = require('fs');

// Read the original file
let svg = fs.readFileSync('attached_assets/Pasted--svg-width-1920-height-2080-viewBox-0-0-1920-2080-fill-_1773682183677.txt', 'utf8');

// There's a `<path d="..." fill="#171F37"/>` in the file.
// We can use a regex to replace it no matter the case or spacing
svg = svg.replace(/fill="#171[fF]37"/gi, 'fill="#FFFFFF"');

// The original logo has the words "Locações" and "São Bento" 
// Let's also look for similar dark blue colors that might be the text
svg = svg.replace(/fill="#181[fF]38"/gi, 'fill="#FFFFFF"');
svg = svg.replace(/fill="#182039"/gi, 'fill="#FFFFFF"');
svg = svg.replace(/fill="#1[aA]2038"/gi, 'fill="#FFFFFF"');
svg = svg.replace(/fill="#232439"/gi, 'fill="#FFFFFF"');
svg = svg.replace(/fill="#242636"/gi, 'fill="#FFFFFF"');

// Ensure we write it back correctly
fs.writeFileSync('client/public/logo-branca.svg', svg);
console.log('Done replacement!');
