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

test('switching language after scrolling to a chapter lands on that chapter', async ({ page }) => {
  // Readers scroll until a heading sits near the top, then switch; the switch used to pick the chapter above.
  await page.setViewportSize({ width: 402, height: 874 });
  await page.goto('/en.html');
  // Scroll without changing the fragment. Mobile WebKit has no mouse wheel;
  // this test concerns the chapter chosen after scrolling, not the input device.
  await page.evaluate(() => window.scrollTo({
    top: window.scrollY + document.getElementById('agent').getBoundingClientRect().top - 120,
    behavior: 'instant'
  }));
  await expect.poll(() => page.evaluate(() => Math.round(document.getElementById('agent').getBoundingClientRect().top))).toBeLessThan(180);
  await page.locator('[data-language="zh-Hant"]').click();
  await expect(page).toHaveURL(/index\.html#agent$/);
  await expect.poll(() => page.evaluate(() => Math.round(document.getElementById('agent').getBoundingClientRect().top)), { timeout: 6000 }).toBeLessThan(140);
});

test('English prompts, diagrams and mobile layout are usable', async ({ page }) => {
  await page.setViewportSize({ width: 402, height: 874 });
  await page.goto('/en.html#cards');
  // Find cards by title, not position: new examples can be added anywhere in a group.
  const reading = page.locator('.prompt-example').filter({ has: page.locator('summary', { hasText: 'Understand and verify a reading' }) });
  await reading.locator('summary').click();
  expect(await reading.locator('textarea').inputValue()).toContain('plain English');
  const deep = page.locator('.prompt-example').filter({ has: page.locator('summary', { hasText: 'Deep Research' }) });
  await deep.locator('summary').click();
  await expect(deep.locator('.prompt-where')).toContainText('Add sources');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.goto('/en.html#diagrams');
  for (const id of ['flow', 'framework', 'gantt', 'timeline', 'mindmap', 'quadrant']) {
    await page.locator(`[data-diagram="${id}"]`).click();
    await expect(page.locator('#diagramImg')).toHaveAttribute('src', `diagrams/en/${id}.svg`);
    await expect(page.locator('#diagramCode')).not.toContainText(/[\u3400-\u9fff]/);
  }
});
