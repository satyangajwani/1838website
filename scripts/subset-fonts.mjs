import { mkdir, rm, stat } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

const fonts = [
  { input: 'assets/fonts/bodoni-moda.ttf', output: 'public/fonts/bodoni-moda-subset.woff2', clampDisplay: true },
  { input: 'assets/fonts/manrope.ttf', output: 'public/fonts/manrope-subset.woff2' },
];

await mkdir('public/fonts', { recursive: true });
for (const { input, output, clampDisplay } of fonts) {
  const source = clampDisplay ? 'public/fonts/.bodoni-clamped.ttf' : input;
  if (clampDisplay) {
    const instanced = spawnSync('python3', ['-m', 'fontTools.varLib.instancer', input, 'opsz=48', 'wght=400:700', '-o', source], { env: process.env, stdio: 'inherit' });
    if (instanced.status !== 0) throw new Error('Unable to clamp Bodoni Moda to the display optical size and 400–700 weight range.');
  }
  const result = spawnSync('python3', ['-m', 'fontTools.subset', source, '--text-file=scripts/font-glyphs.txt', '--flavor=woff2', `--output-file=${output}`, '--layout-features=*'], {
    env: process.env,
    stdio: 'inherit',
  });
  if (result.status !== 0) throw new Error(`Font subsetting failed for ${input}. Install fonttools with brotli support.`);
  if (clampDisplay) await rm(source, { force: true });
  if ((await stat(output)).size > 20 * 1024 && output.includes('bodoni')) throw new Error('Display subset exceeds the 20 KB U2 budget. Reduce the glyph set.');
}
