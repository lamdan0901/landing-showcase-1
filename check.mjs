import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
let checks = 0;
for (const page of ['index.html', 'moc.html', 'volt.html', 'nep.html']) {
  const html = readFileSync(resolve(root, page), 'utf8');
  assert.match(html, /<html lang="vi">/, `${page}: Vietnamese language declaration`);
  assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `${page}: one main heading`);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(ids.length, new Set(ids).size, `${page}: unique IDs`);
  for (const match of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
    const path = match[1];
    if (path.startsWith('#')) assert(ids.includes(path.slice(1)), `${page}: anchor ${path} exists`);
    else assert(existsSync(resolve(root, path)), `${page}: local asset ${path} exists`);
    checks++;
  }
  for (const match of html.matchAll(/<img\b[^>]*>/g)) {
    assert.match(match[0], /\balt="[^"]+"/, `${page}: image has descriptive alt text`);
    checks++;
  }
  for (const match of html.matchAll(/data-case="([^"]+)"/g)) {
    assert(ids.includes(match[1]), `${page}: case template exists`);
    checks++;
  }
  for (const match of html.matchAll(/aria-controls="([^"]+)"/g)) {
    assert(ids.includes(match[1]), `${page}: controlled element exists`);
    checks++;
  }
  console.log(`PASS ${page}`);
}
for (const file of ['shared.css', 'moc.css', 'volt.css', 'nep.css', 'index.css', 'assets/fonts.css']) {
  const css = readFileSync(resolve(root, file), 'utf8');
  for (const match of css.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*))\s*\)/g)) {
    const path = (match[1] || match[2] || match[3]).trim();
    if (!path.startsWith('data:')) assert(existsSync(resolve(root, dirname(file), path)), `${file}: ${path} exists`);
    checks++;
  }
}
assert.match(readFileSync(resolve(root, 'shared.css'), 'utf8'), /prefers-reduced-motion/);
console.log(`PASS ${checks} asset, anchor, accessibility and interaction checks`);
