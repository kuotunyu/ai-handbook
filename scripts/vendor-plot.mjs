import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const vendorDir = path.join(root, 'vendor');
const plotDir = path.join(root, 'node_modules', '@observablehq', 'plot');
const d3Dir = path.join(root, 'node_modules', 'd3');
const files = [
  [path.join(d3Dir, 'dist', 'd3.min.js'), path.join(vendorDir, 'd3.min.js')],
  [path.join(d3Dir, 'LICENSE'), path.join(vendorDir, 'd3.LICENSE')],
  [path.join(plotDir, 'dist', 'plot.umd.min.js'), path.join(vendorDir, 'observable-plot.umd.min.js')],
  [path.join(plotDir, 'LICENSE'), path.join(vendorDir, 'observable-plot.LICENSE')]
];

for (const [source, target] of files) {
  if (!fs.existsSync(source)) {
    throw new Error(`Required vendor source is missing: ${source}. Run npm install first.`);
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

console.log('Vendored D3 7.x and Observable Plot 0.6.17 for lazy local loading.');
