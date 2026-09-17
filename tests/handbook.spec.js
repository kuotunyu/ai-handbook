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

test('tool switch shows only the selected agent instructions', async ({ page }) => {
  const codex = page.locator('[data-tool="codex"]');
  const claude = page.locator('[data-tool="claude"]');

  await codex.click();
  await expect(codex).toHaveAttribute('aria-checked', 'true');
  await expect(page.locator('[data-tool-panel="codex"]')).toBeVisible();
  await expect(page.locator('[data-tool-panel="claude"]')).toBeHidden();

  await claude.click();
  await expect(claude).toHaveAttribute('aria-checked', 'true');
  await expect(page.locator('[data-tool-panel="claude"]')).toBeVisible();
  await expect(page.locator('[data-tool-panel="codex"]')).toBeHidden();
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

test('missing-value Plot lab lazy-loads and changes the interpretation', async ({ page }) => {
  const lesson = page.locator('#lesson-missing');
  await lesson.locator(':scope > summary').click();
  await expect(page.locator('#missingPlotLab')).toBeVisible();
  await expect(page.locator('#missingPlot svg')).toBeVisible({ timeout: 5000 });
  await page.locator('[data-missing-mode="zero"]').click();
  await expect(page.locator('#missingPlotTakeaway')).toContainText('錯誤示範');
  await expect(page.locator('[data-missing-mode="zero"]')).toHaveAttribute('aria-pressed', 'true');
});

test('has no critical axe accessibility violations', async ({ page }) => {
  const results = await new AxeBuilder({ page }).analyze();
  const critical = results.violations.filter(violation => violation.impact === 'critical');
  expect(critical, JSON.stringify(critical, null, 2)).toEqual([]);
});
