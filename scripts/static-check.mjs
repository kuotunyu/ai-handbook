import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const htmlPath = path.join(root, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const ids = new Set([...html.matchAll(/\bid=["']([^"']+)["']/g)].map(match => match[1]));
const missing = [];

for (const match of html.matchAll(/\bhref=["']#([^"']+)["']/g)) {
  const id = match[1];
  if (!ids.has(id)) missing.push(`Missing anchor target: #${id}`);
}

const localAttributes = [...html.matchAll(/\b(?:src|href|poster)=["']([^"']+)["']/g)].map(match => match[1]);
for (const value of localAttributes) {
  if (
    value.startsWith('#') ||
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('mailto:') ||
    value.startsWith('tel:') ||
    value.startsWith('data:') ||
    value.startsWith('javascript:')
  ) continue;

  const clean = value.split(/[?#]/)[0];
  if (!clean) continue;
  const file = path.resolve(root, clean);
  if (!fs.existsSync(file)) missing.push(`Missing local file: ${value}`);
}

const requiredSections = ['hero', 'keywords', 'situations', 'concepts', 'prompt', 'reading', 'agent', 'diagrams', 'rules', 'cards'];
for (const id of requiredSections) {
  if (!ids.has(id)) missing.push(`Missing required section: #${id}`);
}

if (missing.length) {
  console.error('Static checks failed:\n' + missing.map(item => `- ${item}`).join('\n'));
  process.exit(1);
}

console.log(`Static checks passed: ${ids.size} ids inspected, local references exist, core sections present.`);
