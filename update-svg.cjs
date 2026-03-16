const fs = require('fs');
let svg = fs.readFileSync('client/public/logo-branca2.svg', 'utf8');

// The original dark color used for text in the SVG was 171F37
// Let's replace ALL fills in the paths that might be the text
// Replace any fill that contains 171f37, 181f38, etc to FFFFFF
svg = svg.replace(/fill="#(171F37|181F38|182039|1A2038|232439|242636)"/gi, 'fill="#FFFFFF"');

// Force replace the text color - sometimes tools add a space or different casing
svg = svg.replace(/fill\s*=\s*['"]#171F37['"]/gi, 'fill="#FFFFFF"');

fs.writeFileSync('client/public/logo-branca2.svg', svg);
console.log('Done SVG text replace');
