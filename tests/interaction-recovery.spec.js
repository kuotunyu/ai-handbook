const { test, expect } = require('@playwright/test');

async function clipboardFixture(page, mode = 'success') {
  await page.addInitScript(mode => {
    window.__copiedTexts = [];
    window.__fallbackAttempts = 0;
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
      writeText: async text => {
        if (mode !== 'success') throw new Error('Clipboard denied by fixture');
        window.__copiedTexts.push(text);
      }
    } });
    document.execCommand = command => {
      if (command !== 'copy') return false;
      window.__fallbackAttempts++;
      return mode === 'fallback';
    };
  }, mode);
}

for (const file of ['index.html', 'en.html']) {
  test(file + ': repeated copy restores labels and independent buttons', async ({ page }) => {
    await clipboardFixture(page);
    await page.goto('/' + file);
    const reading = page.locator('#readingCopy'), builder = page.locator('#builderCopy');
    const readingLabel = await reading.textContent(), builderLabel = await builder.textContent();
    await page.clock.install();
    await reading.dblclick();
    await expect.poll(() => page.evaluate(() => window.__copiedTexts.length)).toBe(2);
    await builder.click();
    await expect.poll(() => page.evaluate(() => window.__copiedTexts.length)).toBe(3);
    await page.clock.fastForward(2000);
    await expect(reading).toHaveText(readingLabel);
    await expect(builder).toHaveText(builderLabel);
    await expect(reading).not.toHaveClass(/copied/);
    await expect(builder).not.toHaveClass(/copied/);
    const texts = await page.evaluate(() => window.__copiedTexts);
    expect(texts[0]).toBe(texts[1]);
    expect(texts[0]).toContain('[3]');
  });

  for (const mode of ['fallback', 'failure']) {
    test(file + ': clipboard rejection preserves ' + mode + ' behavior', async ({ page }) => {
      await clipboardFixture(page, mode);
      await page.goto('/' + file);
      const button = page.locator('#builderCopy');
      const label = await button.textContent();
      await button.click();
      await expect.poll(() => page.evaluate(() => window.__fallbackAttempts)).toBe(1);
      if (mode === 'fallback') {
        await expect(button).toHaveClass(/copied/);
        await expect(button).toHaveText(label, { timeout: 3000 });
      } else {
        await expect(button).not.toHaveClass(/copied/);
        await expect(button).toHaveText(label);
        await expect(page.locator('#toast')).toContainText(file === 'en.html' ? /manually/i : '手動複製');
        const selection = await page.locator('.builder-output textarea').first().evaluate(editor => ({
          focused: document.activeElement === editor, start: editor.selectionStart,
          end: editor.selectionEnd, length: editor.value.length
        }));
        expect(selection.focused).toBe(true);
        expect(selection.start).toBe(0);
        expect(selection.end).toBe(selection.length);
        expect(selection.length).toBeGreaterThan(0);
      }
    });
  }

  const invalid = [
    ...[{}, 7, 'not-an-array', null].map(rules => JSON.stringify({ rules, other: 'retained' })),
    '[]', '[1]', '7', '"text"', 'null', '{broken'
  ];
  for (const raw of invalid) {
    test(file + ': malformed storage does not interrupt startup: ' + raw, async ({ page }) => {
      await page.addInitScript(raw => {
        localStorage.setItem('ai-handbook-v3', raw);
        sessionStorage.setItem('recovery-unrelated', 'retained');
      }, raw);
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto('/' + file);
      await expect(page.locator('#cardLib .prompt-example')).toHaveCount(11);
      await expect(page.locator('#rulesChecklist input:checked')).toHaveCount(0);
      const card = page.locator('#cardLib .prompt-example').first();
      await card.locator('summary').click();
      await card.locator('textarea').fill('Editable after recovery');
      await expect(card.locator('textarea')).toHaveValue('Editable after recovery');
      if (await page.locator('#menuBtn').isVisible()) {
        await page.locator('#menuBtn').click();
        await expect(page.locator('#menuBtn')).toHaveAttribute('aria-expanded', 'true');
      }
      expect(await page.evaluate(() => localStorage.getItem('ai-handbook-v3'))).toBe(raw);
      expect(await page.evaluate(() => sessionStorage.getItem('recovery-unrelated'))).toBe('retained');
      expect(errors).toEqual([]);
    });
  }

  test(file + ': valid rules refresh and reset while unrelated data survives', async ({ page }) => {
    await page.goto('/' + file);
    await page.evaluate(() => localStorage.setItem('ai-handbook-v3', JSON.stringify({ rules: ['r1', 'unknown', 7, null], other: 'retained' })));
    await page.reload();
    await expect(page.locator('[data-rule="r1"]')).toBeChecked();
    await expect(page.locator('#rulesChecklist input:checked')).toHaveCount(1);
    await page.locator('[data-rule="r2"]').check();
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('ai-handbook-v3')))).toEqual({ rules: ['r1', 'r2'], other: 'retained' });
    await page.reload();
    await expect(page.locator('#rulesChecklist input:checked')).toHaveCount(2);
    await page.locator('#rulesReset').click();
    await expect(page.locator('#rulesChecklist input:checked')).toHaveCount(0);
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('ai-handbook-v3')))).toEqual({ rules: [], other: 'retained' });
  });

  test(file + ': denied localStorage writes leave controls interactive', async ({ page }) => {
    await page.addInitScript(() => {
      const original = Storage.prototype.setItem;
      Storage.prototype.setItem = function (key, value) {
        if (this === localStorage) throw new DOMException('Denied by fixture', 'QuotaExceededError');
        return original.call(this, key, value);
      };
    });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/' + file);
    await expect(page.locator('#cardLib .prompt-example')).toHaveCount(11);
    await page.locator('[data-rule="r1"]').check();
    await expect(page.locator('[data-rule="r1"]')).toBeChecked();
    await page.locator('#rulesReset').click();
    await expect(page.locator('#rulesChecklist input:checked')).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}
