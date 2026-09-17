const { test, expect } = require('@playwright/test');

test('language switch retains the chapter and separate drafts; a fresh root stays Chinese', async ({ page }) => {
  await page.goto('/index.html#prompt');
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-Hant');
  await page.locator('#prompt-edit-0-1').fill('中文草稿');
  await page.locator('[data-language="en"]').click();
  await expect(page).toHaveURL(/en\.html#prompt$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.locator('#prompt-edit-0-1').fill('My English draft');
  await page.locator('[data-language="zh-Hant"]').click();
  await expect(page).toHaveURL(/index\.html#prompt$/);
  await expect(page.locator('#prompt-edit-0-1')).toHaveValue('中文草稿');
  await page.locator('[data-language="en"]').click();
  await expect(page.locator('#prompt-edit-0-1')).toHaveValue('My English draft');
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-Hant');
});

test('English prompts, diagrams and mobile layout are usable', async ({ page }) => {
  await page.setViewportSize({ width: 402, height: 874 });
  await page.goto('/en.html#cards');
  await page.locator('.prompt-example summary').first().click();
  expect(await page.locator('#saved-prompt-0').inputValue()).toContain('plain English');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.goto('/en.html#diagrams');
  for (const id of ['flow', 'framework', 'gantt', 'timeline', 'mindmap', 'quadrant']) {
    await page.locator(`[data-diagram="${id}"]`).click();
    await expect(page.locator('#diagramImg')).toHaveAttribute('src', `diagrams/en/${id}.svg`);
    await expect(page.locator('#diagramCode')).not.toContainText(/[\u3400-\u9fff]/);
  }
});
