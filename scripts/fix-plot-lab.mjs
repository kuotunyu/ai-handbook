import fs from 'node:fs';

const path = 'app.js';
let source = fs.readFileSync(path, 'utf8');
const before = '  const buttons = $("[data-missing-mode]", $("#missingPlotLab"));';
const after = '  const buttons = $$("[data-missing-mode]", $("#missingPlotLab"));';

if (source.includes(after)) {
  console.log('Plot selector already fixed.');
  process.exit(0);
}
if (!source.includes(before)) throw new Error('Plot button selector not found.');
source = source.replace(before, after);
fs.writeFileSync(path, source);
console.log('Fixed Plot button selector to return all controls.');
