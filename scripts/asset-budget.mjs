import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const KiB = 1024;
const MiB = 1024 * KiB;

// These are guardrails, not optimization targets. They intentionally leave
// headroom above the current site so one normal edit does not fail CI, while
// still catching a accidentally huge render or a slow growth in core files.
const exactBudgets = new Map([
  ['index.html', 100 * KiB],
  ['app.js', 70 * KiB],
  ['styles.css', 120 * KiB],
  ['diagrams.js', 15 * KiB],
  ['en.html', 100 * KiB],
  ['app.en.js', 70 * KiB],
  ['diagrams.en.js', 15 * KiB],
  ['language.js', 8 * KiB]
]);

const extensionBudgets = new Map([
  ['.mp4', 1.5 * MiB],
  ['.png', 350 * KiB],
  ['.svg', 100 * KiB],
  ['.pdf', 750 * KiB]
]);

const folderBudgets = new Map([
  ['media', 15 * MiB],
  ['diagrams', 750 * KiB]
]);

const errors = [];
const notes = [];

function human(bytes) {
  if (bytes >= MiB) return `${(bytes / MiB).toFixed(2)} MiB`;
  return `${(bytes / KiB).toFixed(1)} KiB`;
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

for (const [relative, limit] of exactBudgets) {
  const full = path.join(root, relative);
  if (!fs.existsSync(full)) {
    errors.push(`Missing budgeted core file: ${relative}`);
    continue;
  }
  const size = fs.statSync(full).size;
  notes.push(`${relative}: ${human(size)} / ${human(limit)}`);
  if (size > limit) errors.push(`${relative} is ${human(size)}; budget is ${human(limit)}.`);
}

for (const folder of ['media', 'diagrams', 'materials']) {
  for (const full of walk(path.join(root, folder))) {
    const ext = path.extname(full).toLowerCase();
    const limit = extensionBudgets.get(ext);
    if (!limit) continue;
    const size = fs.statSync(full).size;
    const relative = path.relative(root, full);
    if (size > limit) errors.push(`${relative} is ${human(size)}; per-file ${ext} budget is ${human(limit)}.`);
  }
}

for (const [folder, limit] of folderBudgets) {
  const files = walk(path.join(root, folder));
  const total = files.reduce((sum, file) => sum + fs.statSync(file).size, 0);
  notes.push(`${folder}/ total: ${human(total)} / ${human(limit)}`);
  if (total > limit) errors.push(`${folder}/ totals ${human(total)}; folder budget is ${human(limit)}.`);
}

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const videoTags = [...html.matchAll(/<video\b[^>]*>/gi)].map(match => match[0]);
for (const tag of videoTags) {
  if (/\bautoplay\b/i.test(tag)) errors.push('Video autoplay is not allowed; motion must remain user-initiated.');
  if (/\bpreload\s*=\s*["']auto["']/i.test(tag)) errors.push('Video preload="auto" is not allowed; keep large media demand-loaded.');
}
notes.push(`${videoTags.length} video tags checked: no autoplay/preload-auto.`);

if (errors.length) {
  console.error('Asset budget failed:\n' + errors.map(error => `- ${error}`).join('\n'));
  console.error('\nCurrent budget snapshot:\n' + notes.map(note => `- ${note}`).join('\n'));
  process.exit(1);
}

console.log('Asset budget passed:\n' + notes.map(note => `- ${note}`).join('\n'));
