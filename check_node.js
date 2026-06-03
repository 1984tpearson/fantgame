
// Minimal stubs so aerdorn.js doesn't crash
window = {};
window.WORLD_MAP_IMAGE = '';
window.WORLD_DATA = null;

// Run aerdorn.js
const fs = require('fs');
eval(fs.readFileSync('C:/Users/1984t/OneDrive/Documents/GitHub/fantgame/worlds/aerdorn.js', 'utf8'));

const s = window.WORLD_DATA.settlements['frilar_town'];
const keys = Object.keys(s.map);
console.log('Total keys:', keys.length);

// Find y range
let minY = Infinity, maxY = -Infinity;
let minX = Infinity, maxX = -Infinity;
for (const k of keys) {
    const ci = k.lastIndexOf(',');
    const x = parseInt(k.slice(0,ci));
    const y = parseInt(k.slice(ci+1));
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
}
console.log('X:', minX, 'to', maxX);
console.log('Y:', minY, 'to', maxY);

// Check y=0 count vs y=14 count
let y0=0, y14=0, y28=0;
for (const k of keys) {
    const y = parseInt(k.split(',')[1]);
    if (y===0) y0++;
    if (y===14) y14++;
    if (y===28) y28++;
}
console.log('y=0 cells:', y0, ' y=14 cells:', y14, ' y=28 cells:', y28);
