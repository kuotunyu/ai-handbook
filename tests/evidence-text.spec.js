const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// The PDF authoring source is the independent reference: no sentence, number,
// negative or page footer may disappear from the selectable reading version.
const pdfSource = fs.readFileSync(path.join(__dirname, '../scripts/generate-evidence-pdf.mjs'), 'utf8');
const sourcePages = [1, 2].map(number => {
  const literal = pdfSource.match(new RegExp(`const page${number} = textStream\\((\\[[\\s\\S]*?\\])\\);`))[1];
  return vm.runInNewContext(literal).filter(Boolean).map(line => line.replace(/^(## |- )/, '')).join(' ');
});
const normalize = text => text.replace(/\s+/g, ' ').trim();

test('original-text disclosure remains open after a language round trip', async ({ page }) => {
  await page.goto('/index.html#reading');
  await page.locator('#pdfEvidenceLab > summary').click();
  await page.locator('#evidenceSourceText > summary').click();
  await page.locator('[data-language="en"]').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.locator('[data-language="zh-Hant"]').click();
  await expect(page.locator('#pdfEvidenceLab')).toHaveAttribute('open');
  await expect(page.locator('#evidenceSourceText')).toHaveAttribute('open');
});

for (const [file, label] of [
  ['index.html', '閱讀本頁原文文字'],
  ['en.html', 'Read the original text on this page']
]) {
  test(`${file}: full original text follows page selection even when PDF cannot load`, async ({ page }) => {
    await page.route('**/vendor/pdfjs/**', route => route.abort());
    await page.goto(`/${file}#evidence`);
    await page.locator('#pdfEvidenceLab > summary').click();
    const disclosure = page.locator('#evidenceSourceText');
    await expect(disclosure).not.toHaveAttribute('open');
    const summary = disclosure.locator('summary');
    await expect(summary).toHaveText(label);
    await summary.focus();
    await page.keyboard.press('Space');
    const content = page.locator('#evidenceSourcePage');
    await expect(content).toBeVisible();
    await expect(content).toHaveAttribute('lang', 'en');
    for (const number of [2, 1, 2, 1, 2]) {
      await page.locator(`[data-evidence-page="${number}"]`).click();
      await expect(page.locator(`[data-evidence-page="${number}"]`)).toHaveAttribute('aria-pressed', 'true');
      await expect.poll(async () => normalize(await content.innerText())).toBe(sourcePages[number - 1]);
    }
    await expect(page.locator('#evidencePdfAnswer')).not.toHaveAttribute('open');
    await expect(page.locator('.evidence-pdf-toolbar a')).toHaveAttribute('href', 'materials/evidence-library-pilot.pdf');
    const selected = await content.evaluate(element => {
      const range = document.createRange();
      range.selectNodeContents(element);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      return selection.toString();
    });
    expect(normalize(selected)).toBe(sourcePages[1]);
    for (const width of [375, 402]) {
      await page.setViewportSize({ width, height: 874 });
      expect(await content.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
      expect(await content.evaluate(element => parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(18);
    }
  });
}
