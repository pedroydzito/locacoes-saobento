const fs = require('fs');

const svg = fs.readFileSync('client/public/logo-branca.svg', 'utf8');

// Replace standard dark background and text colors
let updated = svg.replace(/fill="#(171F37|181F38|182039|1A2038|232439|242636)"/gi, 'fill="#FFFFFF"');

fs.writeFileSync('client/public/logo-branca.svg', updated);
console.log('SVG dark colors updated to white!');
