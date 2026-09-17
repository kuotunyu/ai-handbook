import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const vendorDir = path.join(root, 'vendor');
const plotDir = path.join(root, 'node_modules', '@observablehq', 'plot');
const source = path.join(plotDir, 'dist', 'plot.umd.min.js');
const license = path.join(plotDir, 'LICENSE');

if (!fs.existsSync(source)) {
  throw new Error('Observable Plot is not installed. Run npm install first.');
}

fs.mkdirSync(vendorDir, { recursive: true });
fs.copyFileSync(source, path.join(vendorDir, 'observable-plot.umd.min.js'));
if (fs.existsSync(license)) {
  fs.copyFileSync(license, path.join(vendorDir, 'observable-plot.LICENSE'));
}

console.log('Vendored Observable Plot 0.6.17 for lazy local loading.');
