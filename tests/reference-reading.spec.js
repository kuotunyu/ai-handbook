const { test, expect } = require('@playwright/test');

for (const file of ['index.html', 'en.html']) {
  test(`${file}: reference stays optional and direct links reveal all illustrations`, async ({ page }) => {
    await page.goto(`/${file}#agent`);
    const panel = page.locator('#ai-forms');
    await expect(panel).toHaveJSProperty('open', false);
    const summary = panel.locator(':scope > summary');
    await summary.focus();
    await page.keyboard.press('Enter');
    await expect(panel).toHaveJSProperty('open', true);
    await expect(panel.locator('.form-shot')).toHaveCount(12);
    await expect(panel.locator('.forms-legend li')).toHaveCount(5);
    await expect(panel.locator('.forms-table tbody tr')).toHaveCount(3);
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(panel).toHaveJSProperty('open', true);
    await summary.focus();
    await page.keyboard.press('Space');
    await expect(panel).toHaveJSProperty('open', false);
    await page.keyboard.press('Tab');
    expect(await panel.evaluate(el => el.contains(document.activeElement))).toBe(false);
    await page.locator('a[href="#ai-forms"]').click();
    await expect(panel).toHaveJSProperty('open', true);
    await page.goto(`/${file}#ai-forms`);
    await expect(panel).toHaveJSProperty('open', true);
    await expect(panel.locator('.forms-table')).toBeVisible();
    await expect.poll(() => summary.evaluate(el => el.getBoundingClientRect().top >= document.querySelector('.topbar').getBoundingClientRect().bottom)).toBe(true);
  });

  test(`${file}: each reading button copies only its own question`, async ({ page }) => {
    await page.addInitScript(() => {
      window.__copiedTexts = [];
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
        writeText: async text => { window.__copiedTexts.push(text); }
      } });
    });
    await page.goto(`/${file}#reading`);
    if (file === 'index.html') await expect(page.locator('#reading-prompt-1')).toHaveText('只根據這篇短文，用兩句中文說明發生什麼事、作者建議什麼。不要補外部資訊。');
    for (let n = 1; n <= 4; n++) {
      const expected = await page.locator(`#reading-prompt-${n}`).innerText();
      const button = page.locator(`[data-copy-target="#reading-prompt-${n}"]`);
      await expect(button).toHaveAttribute('aria-label', /.+/);
      await button.click();
      await expect.poll(() => page.evaluate(() => window.__copiedTexts.at(-1))).toBe(expected);
    }
    await expect(page.locator('#cardLib .prompt-example')).toHaveCount(11);
  });

  test(`${file}: obsolete presentation state is ignored without clearing drafts`, async ({ page }) => {
    const language = file === 'index.html' ? 'zh-Hant' : 'en';
    await page.addInitScript(language => {
      sessionStorage.setItem('ai-handbook-language-pending', JSON.stringify(language));
      sessionStorage.setItem('ai-handbook-language-' + language, JSON.stringify({ open: Array(80).fill(true) }));
      sessionStorage.setItem('ai-handbook-draft-preservation-test', 'keep this draft');
    }, language);
    await page.goto(`/${file}#agent`);
    await expect(page.locator('#ai-forms')).toHaveJSProperty('open', false);
    expect(await page.evaluate(() => sessionStorage.getItem('ai-handbook-draft-preservation-test'))).toBe('keep this draft');
  });
}

test('reference can open without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/index.html#ai-forms');
  await page.locator('#ai-forms > summary').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#ai-forms .forms-table')).toBeVisible();
  await context.close();
});
