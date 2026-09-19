const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('loads without unexpected console errors', async ({ page }) => {
  const errors = [];
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', error => errors.push(error.message));
  await page.reload();
  await page.waitForLoadState('networkidle');
  expect(errors).toEqual([]);
});

test('core chapter navigation targets exist', async ({ page }) => {
  const targets = ['keywords', 'situations', 'concepts', 'prompt', 'reading', 'agent', 'diagrams', 'rules', 'cards'];
  for (const id of targets) {
    await expect(page.locator(`#${id}`)).toHaveCount(1);
    await expect(page.locator(`#topnav a[href="#${id}"]`)).toHaveCount(1);
  }
});

test('secondary reference material stays off the first-read path', async ({ page }) => {
  const glossary = page.locator('#keyword-reference-disclosure');
  const outputs = page.locator('#notebooklm-output');
  await expect(glossary).not.toHaveAttribute('open', '');
  await expect(outputs).not.toHaveAttribute('open', '');
  await glossary.locator(':scope > summary').click();
  await expect(glossary).toHaveAttribute('open', '');
  await expect(page.locator('#keyword-token')).toBeVisible();
  await expect(page.locator('#situations blockquote')).toHaveCount(0);
  await expect(page.locator('#concepts .tool-table')).toHaveCount(0);
});

test('heavy teaching libraries stay lazy on the first page load', async ({ page }) => {
  const resources = await page.evaluate(() => performance.getEntriesByType('resource').map(entry => entry.name));
  const heavy = resources.filter(name => /\/vendor\/(?:pdfjs\/|observable-plot|d3\.min|citation)/.test(name));
  expect(heavy).toEqual([]);
});

test('prompt builder can change blocks and produce editable output', async ({ page }) => {
  const builder = page.locator('.builder');
  await expect(builder).toBeVisible();

  const buttons = page.locator('#builderBlocks .block-btn');
  await expect(buttons.first()).toBeVisible();

  const initialEditors = await page.locator('#builderResult textarea').count();
  await buttons.nth(0).click();
  const changedEditors = await page.locator('#builderResult textarea').count();
  expect(changedEditors).not.toBe(initialEditors);

  const editor = page.locator('#builderResult textarea').first();
  await expect(editor).toBeEditable();
});

test('agent walkthrough advances and resets', async ({ page }) => {
  const steps = page.locator('#agentSteps .agent-step');
  await expect(steps).toHaveCount(5);
  await expect(steps.nth(0)).toHaveClass(/now/);

  await page.locator('#agentNext').click();
  await expect(steps.nth(1)).toHaveClass(/now/);

  await page.locator('#agentReset').click();
  await expect(steps.nth(0)).toHaveClass(/now/);
});

test('mobile menu remains keyboard-usable', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes('mobile'));
  const button = page.locator('#menuBtn');
  await expect(button).toBeVisible();
  await button.click();
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#topnav')).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(button).toHaveAttribute('aria-expanded', 'false');
});

test('inline explanations stay optional and expand in place', async ({ page }) => {
  const explainers = page.locator('.inline-explain');
  await expect(explainers).toHaveCount(2);
  await expect(explainers.first()).not.toHaveAttribute('open', '');
  await explainers.first().locator('summary').click();
  await expect(explainers.first()).toHaveAttribute('open', '');
  await expect(explainers.first().locator('p')).toContainText('Context');
});

test('PDF evidence lab returns to the original source with a build-generated bibliography', async ({ page }) => {
  const lab = page.locator('#pdfEvidenceLab');
  await lab.locator(':scope > summary').click();
  await expect(page.locator('#evidencePdfStatus')).toContainText('第 2 頁 / 2', { timeout: 10000 });
  await expect(page.locator('#evidenceCitation')).toContainText('Evening Library Hours Pilot', { timeout: 10000 });
  await expect(page.locator('#evidenceCitation')).toHaveAttribute('data-generated-by', /Citation\.js/);
  await expect(page.locator('#evidencePdfCanvas')).toBeVisible();
  await page.locator('[data-evidence-page="1"]').click();
  await expect(page.locator('#evidencePdfStatus')).toContainText('第 1 頁 / 2', { timeout: 10000 });
  await expect(page.locator('[data-evidence-page="1"]')).toHaveAttribute('aria-pressed', 'true');
});

test('unit Plot lab shows why weekly and monthly values must be normalized', async ({ page }) => {
  const lesson = page.locator('#lesson-units');
  await lesson.locator(':scope > summary').click();
  await expect(page.locator('#unitsPlotLab')).toBeVisible();
  await expect(page.locator('#unitsPlot svg')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('#unitsPlotTakeaway')).toContainText('不能直接比');
  await page.locator('[data-unit-mode="monthly"]').click();
  await expect(page.locator('#unitsPlotTakeaway')).toContainText('1,213.33');
  await expect(page.locator('[data-unit-mode="monthly"]')).toHaveAttribute('aria-pressed', 'true');
});

test('missing-value Plot lab lazy-loads and changes the interpretation', async ({ page }) => {
  const lesson = page.locator('#lesson-missing');
  await lesson.locator(':scope > summary').click();
  await expect(page.locator('#missingPlotLab')).toBeVisible();
  await expect(page.locator('#missingPlot svg')).toBeVisible({ timeout: 5000 });
  await page.locator('[data-missing-mode="zero"]').click();
  await expect(page.locator('#missingPlotTakeaway')).toContainText('錯誤示範');
  await expect(page.locator('[data-missing-mode="zero"]')).toHaveAttribute('aria-pressed', 'true');
});

for (const file of ['index.html', 'en.html']) {
  test(`${file}: has no critical axe violations and reports serious findings`, async ({ page }, testInfo) => {
    await page.goto(`/${file}`);
    const results = await new AxeBuilder({ page }).analyze();
    // Review real serious findings before expanding the gate. Keep the complete
    // violations and incomplete checks available; do not silently ignore rules.
    await testInfo.attach(`axe-${file}.json`, {
      body: JSON.stringify({ violations: results.violations, incomplete: results.incomplete }, null, 2),
      contentType: 'application/json'
    });
    const serious = results.violations.filter(violation => violation.impact === 'serious');
    if (serious.length) console.warn(`Serious axe findings for ${file}: ${JSON.stringify(serious, null, 2)}`);
    const critical = results.violations.filter(violation => violation.impact === 'critical');
    expect(critical, JSON.stringify(critical, null, 2)).toEqual([]);
  });
}
