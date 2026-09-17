import fs from 'node:fs';
import citationPackage from 'citation-js';

const Cite = citationPackage?.default || citationPackage?.Cite || citationPackage;
const htmlPath = 'index.html';
const start = '<!-- evidence-citation:start -->';
const end = '<!-- evidence-citation:end -->';
const source = {
  id: 'lin-carter-2026',
  type: 'report',
  title: 'Evening Library Hours Pilot: A Teaching Brief',
  author: [
    { given: 'Mei', family: 'Lin' },
    { given: 'James', family: 'Carter' }
  ],
  issued: { 'date-parts': [[2026]] },
  publisher: 'Urban Learning Methods Lab'
};

const cite = new Cite([source]);
const bibliography = cite.format('bibliography', {
  format: 'html',
  template: 'apa',
  lang: 'en-US'
}).trim();

const generated = [
  start,
  '<div id="evidenceCitation" data-generated-by="Citation.js 0.8.2">',
  bibliography,
  '</div>',
  end
].join('\n');

const html = fs.readFileSync(htmlPath, 'utf8');
const startIndex = html.indexOf(start);
const endIndex = html.indexOf(end);
if (startIndex < 0 || endIndex < 0 || endIndex < startIndex) {
  throw new Error('Evidence citation generation markers are missing from index.html.');
}

const next = html.slice(0, startIndex) + generated + html.slice(endIndex + end.length);
const checkOnly = process.argv.includes('--check');
if (checkOnly) {
  if (next !== html) {
    console.error('Generated evidence citation is out of date. Run: npm run build:evidence-citation');
    console.error('\nExpected generated block:\n' + generated);
    process.exit(1);
  }
  console.log('Generated evidence citation is up to date.');
} else {
  fs.writeFileSync(htmlPath, next);
  console.log('Updated evidence bibliography with Citation.js at build time.');
}
