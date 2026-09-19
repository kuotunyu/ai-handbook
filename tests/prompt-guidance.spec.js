const { test, expect } = require('@playwright/test');

for (const file of ['index.html', 'en.html']) {
  test(`${file}: special output instructions stay outside the copied prompt`, async ({ page }) => {
    await page.goto(`/${file}#cards`);
    await page.evaluate(() => {
      window.copiedPrompt = null;
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
        writeText: async text => { window.copiedPrompt = text; }
      } });
    });
    const card = page.locator('[data-prompt-id="video-infographic"]');
    await card.locator('summary').click();
    await expect(card.locator('.prompt-where')).toBeVisible();
    await expect(card.locator('.prompt-box .prompt-where')).toHaveCount(0);
    const text = 'Edited video prompt\n\n保留逐字內容 café\n';
    await card.locator('textarea').fill(text);
    await card.locator('[data-copy-bottom]').click();
    await expect.poll(() => page.evaluate(() => window.copiedPrompt)).toBe(text);
    await card.locator('.prompt-box-head .primary').click();
    await expect.poll(() => page.evaluate(() => window.copiedPrompt)).toBe(text);
    for (const id of ['audio-overview', 'infographic-slides']) {
      await expect(page.locator(`[data-prompt-id="${id}"] > .prompt-where`)).toHaveCount(1);
    }
  });
}
