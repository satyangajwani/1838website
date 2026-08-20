import { mkdir, stat } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

const fonts = [
  { input: 'collaterals/fonts/stix-two-text/STIXTwoText-VariableFont_wght.ttf', output: 'public/fonts/stix-two-text-subset.woff2' },
  { input: 'collaterals/print-ad/ad-fonts/Montserrat-VariableFont_wght.ttf', output: 'public/fonts/montserrat-subset.woff2' },
];
const requiredGlyphs = 'U+2019';

await mkdir('public/fonts', { recursive: true });
for (const { input, output } of fonts) {
  const result = spawnSync('python3', ['-m', 'fontTools.subset', input, '--text-file=scripts/font-glyphs.txt', `--unicodes=${requiredGlyphs}`, '--flavor=woff2', `--output-file=${output}`, '--layout-features=*'], {
    env: process.env,
    stdio: 'inherit',
  });
  if (result.status !== 0) throw new Error(`Font subsetting failed for ${input}. Install fonttools with brotli support.`);
  if ((await stat(output)).size > 56 * 1024) throw new Error(`Font subset exceeds the 56 KB budget: ${output}`);
}
