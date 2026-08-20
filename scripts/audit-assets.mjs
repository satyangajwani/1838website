import { readFile } from 'node:fs/promises';

const text = await readFile('docs/asset-register.md', 'utf8');
const rows = text.split('\n').filter((line) => line.startsWith('|') && !line.includes('---') && !line.includes('Asset |'));
if (!rows.length) throw new Error('Asset register has no entries');
for (const row of rows) {
  const cells = row.split('|').map((cell) => cell.trim()).filter(Boolean);
  if (cells.length < 4 || cells.slice(1).some((cell) => !cell || cell === '—')) throw new Error(`Incomplete asset row: ${row}`);
  if (cells[3].startsWith('RED') && !/OQ\d/.test(row)) throw new Error(`Red asset must name its open question: ${row}`);
}
console.log(`Asset register audit passed (${rows.length} assets).`);
