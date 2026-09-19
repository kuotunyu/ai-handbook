const { test, expect } = require('@playwright/test');

test('builder keeps hidden blocks across refresh and undo restores exact draft and selection', async ({ page }) => {
  await page.goto('/index.html#prompt');
  const goal = page.locator('#prompt-edit-0-1');
  await expect(page.locator('#builderUndo')).toBeHidden();
  await goal.fill('我的目標\n\n保留換行 ');
  const background = page.locator('#builderBlocks [data-i="2"]');
  await background.click();
  await page.locator('#prompt-edit-0-2').fill('自訂背景\n第二行');
  await background.click();
  await page.reload();
  await expect(goal).toHaveValue('我的目標\n\n保留換行 ');
  await expect(background).toHaveAttribute('aria-pressed', 'false');
  await background.click();
  await expect(page.locator('#prompt-edit-0-2')).toHaveValue('自訂背景\n第二行');
  await page.locator('#builderReset').click();
  await expect(goal).not.toHaveValue('我的目標\n\n保留換行 ');
  await page.locator('#builderUndo').focus();
  await page.keyboard.press('Enter');
  await expect(goal).toHaveValue('我的目標\n\n保留換行 ');
  await expect(background).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#prompt-edit-0-2')).toHaveValue('自訂背景\n第二行');
  await expect(page.locator('#builderUndo')).toBeHidden();
  await page.reload();
  await expect(goal).toHaveValue('我的目標\n\n保留換行 ');
});

test('cards autosave, undo separately and retain independent bilingual drafts', async ({ page }) => {
  await page.goto('/index.html#cards');
  const card = page.locator('.prompt-example[data-prompt-id]').first();
  await card.locator('summary').click();
  const identity = await card.getAttribute('data-prompt-id');
  const current = () => page.locator(`.prompt-example[data-prompt-id="${identity}"]`);
  await current().locator('textarea').fill('中文草稿\n\n最後一行\n');
  await page.reload();
  await current().locator('summary').click();
  await expect(current().locator('textarea')).toHaveValue('中文草稿\n\n最後一行\n');
  await current().locator('[data-prompt-reset]').click();
  await current().locator('[data-draft-undo]').focus();
  await page.keyboard.press('Enter');
  await expect(current().locator('textarea')).toHaveValue('中文草稿\n\n最後一行\n');
  await page.locator('[data-language="en"]').click();
  await current().locator('summary').click();
  await current().locator('textarea').fill('English draft\n');
  await page.locator('[data-language="zh-Hant"]').click();
  await expect(current().locator('textarea')).toHaveValue('中文草稿\n\n最後一行\n');
  await page.locator('[data-language="en"]').click();
  await expect(current().locator('textarea')).toHaveValue('English draft\n');
});

test('invalid drafts and unavailable storage leave editing and reset/undo usable', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    sessionStorage.setItem('ai-handbook-drafts-v1:zh-Hant', '{broken');
  });
  await page.goto('/index.html#prompt');
  await expect(page.locator('#prompt-edit-0-1')).not.toHaveValue('');
  await page.evaluate(() => {
    Storage.prototype.setItem = () => { throw new DOMException('Disabled', 'SecurityError'); };
  });
  await page.locator('#prompt-edit-0-1').fill('仍可編輯\n');
  await expect(page.locator('.builder .draft-status')).toContainText('無法');
  await page.locator('#builderReset').click();
  await page.locator('#builderUndo').click();
  await expect(page.locator('#prompt-edit-0-1')).toHaveValue('仍可編輯\n');
  expect(errors).toEqual([]);
});
