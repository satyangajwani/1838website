import { readFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';

const budget = JSON.parse(await readFile('lib/budget.json', 'utf8'));
const manifest = JSON.parse(await readFile('.next/server/app/page/build-manifest.json', 'utf8'));
const references = await readFile('.next/server/app/page_client-reference-manifest.js', 'utf8');
const pageChunks = [...references.matchAll(/static\/chunks\/[^" ]+?\.js/g)].map(([file]) => file);
const chunks = new Set([...manifest.rootMainFiles, ...manifest.polyfillFiles, ...pageChunks]);
let total = 0;
for (const file of chunks) total += gzipSync(await readFile(`.next/${file}`)).byteLength;
if (total > budget.criticalJavaScriptGzipBytes) throw new Error(`Static JS gzip ${total} exceeds ${budget.criticalJavaScriptGzipBytes}`);
console.log(`Critical-path JS gzip: ${total} bytes (${chunks.size} chunks)`);
