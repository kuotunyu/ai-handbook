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

// The site owner wants half-width brackets and parentheses everywhere, including inside Chinese text.
for (const file of ['index.html', 'app.js', 'diagrams.js']) {
  const text = fs.readFileSync(path.join(root, file), 'utf8');
  // Preserve the owner's verbatim video prompt placeholder.
  const found = text.replace('（把影片連結貼在這裡——開放式課程、教學影片都行）', '').match(/[（）［］]/g);
  if (found) missing.push(`Full-width brackets or parentheses in ${file}: ${found.length}; use [] and () instead`);
}

// The English edition uses English punctuation; Chinese marks left between links read as mistakes.
{
  const page = fs.readFileSync(path.join(root, 'en.html'), 'utf8')
    .replace(/<!--[\s\S]*?-->/g, '').replace(/<div class="language-switch"[\s\S]*?<\/div>/, '');
  const app = fs.readFileSync(path.join(root, 'app.en.js'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  for (const [file, text] of [['en.html', page], ['app.en.js', app]]) {
    const found = text.match(/[　-〿！-？㐀-鿿]/g);
    if (found) missing.push(`Chinese characters or punctuation in ${file}: ${[...new Set(found)].join(' ')}`);
  }
}

// The learner found light text painful: text colour tokens keep a contrast floor on paper and white.
{
  const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
  const token = name => (css.match(new RegExp('--' + name + ':\\s*(#[0-9A-Fa-f]{6})')) || [])[1];
  const lum = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)))
    .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const floors = { 'ink-primary': 7, 'ink-body': 7, 'ink-muted': 7, 'ink-light': 6.5, brand: 6, terracotta: 5.5, emerald: 5.5, gold: 5.2, olive: 5.5, plum: 5.5 };
  for (const bgName of ['bg-page', 'bg-white']) {
    const bg = token(bgName);
    for (const [name, min] of Object.entries(floors)) {
      const color = token(name);
      if (!color || !bg) { missing.push(`Missing colour token --${name} or --${bgName}`); continue; }
      const r = ratio(color, bg);
      if (r < min) missing.push(`Text colour --${name} ${color} on --${bgName} ${bg} is ${r.toFixed(2)}:1, below ${min}:1`);
    }
  }
}

if (missing.length) {
  console.error('Static checks failed:\n' + missing.map(item => `- ${item}`).join('\n'));
  process.exit(1);
}

console.log(`Static checks passed: ${ids.size} ids inspected, local references exist, core sections present, half-width brackets only, text colours readable.`);
