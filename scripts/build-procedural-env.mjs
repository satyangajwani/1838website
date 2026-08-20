import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';

await mkdir('public/env', { recursive: true });
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="1024"><defs><radialGradient id="a" cx="72%" cy="28%"><stop stop-color="#fff3ce"/><stop offset=".2" stop-color="#b78144"/><stop offset=".62" stop-color="#25130c"/><stop offset="1" stop-color="#080504"/></radialGradient></defs><rect width="100%" height="100%" fill="url(#a)"/></svg>`;
await sharp(Buffer.from(svg)).jpeg({ quality: 82, mozjpeg: true }).toFile('public/env/procedural-studio-placeholder.jpg');
