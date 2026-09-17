import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
function copyFirst(candidates, destination) {
  const source = candidates.map(p => path.join(root, p)).find(fs.existsSync);
  if (!source) throw new Error('Missing vendor source for ' + destination + ': ' + candidates.join(', '));
  const dest = path.join(root, destination);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(source, dest);
}

copyFirst([
  'node_modules/pdfjs-dist/build/pdf.min.mjs',
  'node_modules/pdfjs-dist/build/pdf.mjs'
], 'vendor/pdfjs/pdf.min.mjs');
copyFirst([
  'node_modules/pdfjs-dist/build/pdf.worker.min.mjs',
  'node_modules/pdfjs-dist/build/pdf.worker.mjs'
], 'vendor/pdfjs/pdf.worker.min.mjs');
copyFirst(['node_modules/pdfjs-dist/LICENSE'], 'vendor/pdfjs/LICENSE');
console.log('Vendored PDF.js 6.3.289 for the source-verification lab. Citation.js stays build-time only.');
