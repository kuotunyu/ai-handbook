import fs from 'node:fs';

function replaceRequired(text, from, to, label) {
  if (text.includes(to)) return text;
  if (!text.includes(from)) throw new Error(`Could not find ${label}`);
  return text.replace(from, to);
}

let html = fs.readFileSync('index.html', 'utf8');
let js = fs.readFileSync('app.js', 'utf8');
let tests = fs.readFileSync('tests/handbook.spec.js', 'utf8');
let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
let vendor = fs.readFileSync('scripts/vendor-research-tools.mjs', 'utf8');
let agents = fs.readFileSync('AGENTS.md', 'utf8');

const oldCitation = '<div id="evidenceCitation">Lin, M., &amp; Carter, J. (2026). <em>Evening Library Hours Pilot: A Teaching Brief</em>. Urban Learning Methods Lab.</div>';
const citationMarkers = '<!-- evidence-citation:start -->\n' + oldCitation + '\n<!-- evidence-citation:end -->';
html = replaceRequired(html, oldCitation, citationMarkers, 'static evidence citation');

js = js.replace('  const citation = $("#evidenceCitation");\n', '');
js = js.replace(' || !citation || !pageButtons.length', ' || !pageButtons.length');
js = js.replace('  let citationLoaded = false;\n', '');
js = js.replace(/\n  async function formatCitation\(\) \{[\s\S]*?\n  \}\n\n  async function ensurePdf\(\) \{/m, '\n  async function ensurePdf() {');
js = js.replace('    formatCitation();\n', '');
if (js.includes('vendor/citation.min.js') || js.includes('formatCitation()')) {
  throw new Error('Runtime Citation.js references remain in app.js.');
}

vendor = vendor.replace("copyFirst(['node_modules/citation-js/build/citation.min.js'], 'vendor/citation.min.js');\n", '');
vendor = vendor.replace("copyFirst(['node_modules/citation-js/LICENSE.md'], 'vendor/citation.LICENSE.md');\n", '');
vendor = vendor.replace("console.log('Vendored PDF.js 6.3.289 and Citation.js 0.8.2.');", "console.log('Vendored PDF.js 6.3.289 for the source-verification lab. Citation.js stays build-time only.');");

pkg.scripts['build:evidence-citation'] = 'node scripts/build-evidence-citation.mjs';
pkg.scripts['check:generated'] = 'node scripts/build-evidence-citation.mjs --check';
pkg.scripts.check = 'npm run check:generated && npm run check:static && npm test';

const navTestEnd = `test('prompt builder can change blocks and produce editable output', async ({ page }) => {`;
const lazyTest = `test('heavy teaching libraries stay lazy on the first page load', async ({ page }) => {\n  const resources = await page.evaluate(() => performance.getEntriesByType('resource').map(entry => entry.name));\n  const heavy = resources.filter(name => /\\/vendor\\/(?:pdfjs\\/|observable-plot|d3\\.min|citation)/.test(name));\n  expect(heavy).toEqual([]);\n});\n\n${navTestEnd}`;
tests = replaceRequired(tests, navTestEnd, lazyTest, 'lazy-resource Playwright test');
tests = tests.replace("test('PDF evidence lab returns to the original source and formats the bibliography', async ({ page }) => {", "test('PDF evidence lab returns to the original source with a build-generated bibliography', async ({ page }) => {");
const citationExpectation = `  await expect(page.locator('#evidenceCitation')).toContainText('Evening Library Hours Pilot', { timeout: 10000 });`;
const generatedExpectation = citationExpectation + `\n  await expect(page.locator('#evidenceCitation')).toHaveAttribute('data-generated-by', /Citation\\.js/);`;
tests = replaceRequired(tests, citationExpectation, generatedExpectation, 'generated citation test assertion');

const oldGuardrail = '- PDF.js + Citation.js are used for one source-verification exercise; do not turn the handbook into a general PDF reader. Citation formatting is not evidence validation.';
const newGuardrail = '- PDF.js is used at runtime for one source-verification exercise; do not turn the handbook into a general PDF reader. Citation.js formats the known bibliography at authoring/build time only, so the browser does not download its large bundle. Citation formatting is not evidence validation.';
agents = replaceRequired(agents, oldGuardrail, newGuardrail, 'Citation.js architecture guardrail');

fs.writeFileSync('index.html', html);
fs.writeFileSync('app.js', js);
fs.writeFileSync('tests/handbook.spec.js', tests);
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
fs.writeFileSync('scripts/vendor-research-tools.mjs', vendor);
fs.writeFileSync('AGENTS.md', agents);
console.log('Applied runtime simplification: Citation.js is build-time only and heavy libraries remain lazy.');
