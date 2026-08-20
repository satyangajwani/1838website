import { mkdir, stat } from 'node:fs/promises';
import { basename, extname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import sharp from 'sharp';

const input = process.argv[2] ?? 'reference/assets/cardPedestalText.png';
const outputDir = resolve('public/stage');
const widths = [1080, 1440, 1920];
const quality = 58;
const inputStat = await stat(input);
await mkdir(outputDir, { recursive: true });
const stem = basename(input, extname(input)).replace(/[^a-z0-9]+/gi, '-').toLowerCase();

for (const width of widths) {
  if (width > 1998 && inputStat.size) throw new Error(`Refusing to upscale ${input} to ${width}px`);
  const avif = resolve(outputDir, `${stem}-${width}.avif`);
  const webp = resolve(outputDir, `${stem}-${width}.webp`);
  const av1 = spawnSync('ffmpeg', ['-y', '-i', input, '-vf', `scale=${width}:-2`, '-c:v', 'libsvtav1', '-pix_fmt', 'yuv420p10le', '-crf', '35', '-preset', '6', avif], { stdio: 'inherit' });
  if (av1.status !== 0) throw new Error(`SVT-AV1 encode failed for ${width}px`);
  const fallback = spawnSync('ffmpeg', ['-y', '-i', input, '-vf', `scale=${width}:-2`, '-c:v', 'libwebp', '-q:v', String(quality), webp], { stdio: 'ignore' });
  if (fallback.status !== 0) {
    // Homebrew's ffmpeg build lacks libwebp; sharp retains the required fallback output.
    await sharp(input).resize({ width, withoutEnlargement: true }).webp({ quality }).toFile(webp);
    console.warn(`PLACEHOLDER: used sharp WebP fallback at ${width}px because ffmpeg lacks libwebp.`);
  }
}
