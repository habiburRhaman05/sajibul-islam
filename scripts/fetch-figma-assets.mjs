#!/usr/bin/env node
/**
 * Downloads every image the site references from the Figma file, using the Figma REST API.
 *
 *   FIGMA_TOKEN=figd_xxx node scripts/fetch-figma-assets.mjs
 *
 * Token: Figma > Settings > Security > Personal access tokens > scope "File content: Read".
 * Needs Node 18+. Reads assets/manifest.json (node id, format, scale per file) and writes into assets/.
 * Re-run any time; existing files are overwritten.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const token = process.env.FIGMA_TOKEN;
if (!token) { console.error('Set FIGMA_TOKEN first.'); process.exit(1); }

const { fileKey, assets } = JSON.parse(await readFile(join(root, 'assets', 'manifest.json'), 'utf8'));
await mkdir(join(root, 'assets'), { recursive: true });

// Group by format+scale so each API call uses one setting.
const groups = new Map();
for (const [file, meta] of Object.entries(assets)) {
  const k = `${meta.format}@${meta.scale}`;
  if (!groups.has(k)) groups.set(k, []);
  groups.get(k).push({ file, id: meta.id });
}

let ok = 0, failed = [];
for (const [k, items] of groups) {
  const [format, scale] = k.split('@');
  for (let i = 0; i < items.length; i += 20) {
    const batch = items.slice(i, i + 20);
    const ids = batch.map((b) => b.id).join(',');
    const url = `https://api.figma.com/v1/images/${fileKey}?ids=${encodeURIComponent(ids)}&format=${format}&scale=${scale}`;
    const res = await fetch(url, { headers: { 'X-Figma-Token': token } });
    if (!res.ok) { console.error('API error', res.status, await res.text()); process.exit(1); }
    const { images, err } = await res.json();
    if (err) { console.error('API error:', err); process.exit(1); }
    await Promise.all(batch.map(async ({ file, id }) => {
      const src = images[id];
      if (!src) { failed.push(`${file} (${id}): no render URL`); return; }
      const img = await fetch(src);
      if (!img.ok) { failed.push(`${file} (${id}): HTTP ${img.status}`); return; }
      await writeFile(join(root, 'assets', file), Buffer.from(await img.arrayBuffer()));
      ok++; console.log('saved', file);
    }));
  }
}
console.log(`\nDone: ${ok} saved, ${failed.length} failed`);
if (failed.length) { console.log(failed.join('\n')); process.exitCode = 1; }
