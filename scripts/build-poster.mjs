import sharp from 'sharp';
import { mkdir, rm } from 'node:fs/promises';

await mkdir('public/stage', { recursive: true });

// The source composition becomes unsafe below y=1090: the physical plaque,
// proposition, fee and gold Visa mark are baked into the pixels there. Keep
// these crops explicit so a future asset refresh cannot quietly reintroduce
// duplicate copy into the viewport.
const cardCrop = { left: 200, top: 82, width: 1598, height: 823 };
const wall = sharp('reference/assets/1838bg.png');
const card = sharp('reference/assets/cardPedestalText.png').extract(cardCrop);

await Promise.all([
  wall.clone().avif({ quality: 58, effort: 7 }).toFile('public/stage/wall-khanna-1838.avif'),
  wall.clone().webp({ quality: 66 }).toFile('public/stage/wall-khanna-1838.webp'),
  card.clone().avif({ quality: 68, effort: 7 }).toFile('public/stage/card-clean-4fd2.avif'),
  card.clone().webp({ quality: 76 }).toFile('public/stage/card-clean-4fd2.webp'),
]);

await Promise.all([
  'wall-8d3a.avif', 'wall-8d3a.webp',
  'card-stand-9c28.avif', 'card-stand-9c28.webp',
  'card-stand-clean-c6ae.avif', 'card-stand-clean-c6ae.webp',
  'plinth-clean-a8c4.avif', 'plinth-clean-a8c4.webp',
  'cardpedestaltext-1080.avif', 'cardpedestaltext-1080.webp',
  'cardpedestaltext-1440.avif', 'cardpedestaltext-1440.webp',
  'cardpedestaltext-1920.avif', 'cardpedestaltext-1920.webp',
].map((name) => rm(`public/stage/${name}`, { force: true })));
