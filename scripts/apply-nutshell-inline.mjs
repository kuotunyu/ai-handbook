import fs from 'node:fs';

function replaceOnce(text, from, to, label) {
  if (text.includes(to)) return { text, changed: false };
  if (!text.includes(from)) throw new Error(`Could not find insertion point: ${label}`);
  return { text: text.replace(from, to), changed: true };
}

let html = fs.readFileSync('index.html', 'utf8');
let css = fs.readFileSync('styles.css', 'utf8');
let tests = fs.readFileSync('tests/handbook.spec.js', 'utf8');
let changed = false;

const promptNote = '      <p class="section-note">先說目標、給相關材料，就能開始。下面兩套積木幫你找缺少的資訊：先試簡短版本，看回答哪裡不合用，再補一塊重試。不必填滿，也不用背順序。</p>';
const promptHelp = `${promptNote}\n      <div class="inline-explain-row" aria-label="需要時再看名詞">\n        <span class="inline-explain-label">需要時再看：</span>\n        <details class="inline-explain">\n          <summary>Context vs Training</summary>\n          <p><strong>Context</strong> 是這次工作時 AI 能參考的背景與材料；把履歷、作業要求或文件貼進來，通常是在提供 Context。<strong>Training</strong> 才是用資料更新模型本身。</p>\n        </details>\n      </div>`;
let r = replaceOnce(html, promptNote, promptHelp, 'prompt inline explanation');
html = r.text; changed ||= r.changed;

const agentNote = '      <p class="section-note">Agent 會在你的資料夾裡動手做事。你不用會寫程式，但要會講範圍、會驗收。先看一個示意，再真的交辦一次。</p>';
const agentHelp = `${agentNote}\n      <div class="inline-explain-row" aria-label="需要時再看名詞">\n        <span class="inline-explain-label">需要時再看：</span>\n        <details class="inline-explain">\n          <summary>Agent 是什麼？</summary>\n          <p>不是只回一句答案，而是能讀檔、使用工具、分步執行，再依結果繼續處理。因為它真的會動手，所以要限定範圍、保留原檔、完成後驗收。</p>\n        </details>\n      </div>`;
r = replaceOnce(html, agentNote, agentHelp, 'agent inline explanation');
html = r.text; changed ||= r.changed;

const cssMarker = '/* ============ 短片 ============ */';
const inlineCss = `/* ============ 原地解釋：借鑑 Nutshell 的 progressive disclosure，但用原生 details 避免額外 runtime ============ */\n.inline-explain-row { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 10px; margin: -8px 0 18px; color: var(--ink-muted); font-size: var(--fs-sm); }\n.inline-explain-label { font-weight: 600; }\n.inline-explain { flex: 0 1 auto; }\n.inline-explain[open] { flex-basis: 100%; }\n.inline-explain > summary { display: inline-flex; min-height: 30px; padding: 2px 2px; gap: 6px; font-size: var(--fs-sm); color: var(--brand); border-bottom: 1px dotted var(--brand-border); }\n.inline-explain > summary::before { width: 16px; height: 16px; font-size: 13px; color: var(--brand); background: transparent; border: 1px solid currentColor; border-radius: 50%; }\n.inline-explain > summary:hover::before { color: var(--terracotta); background: transparent; }\n.inline-explain > p { max-width: 52em; margin: 7px 0 0; padding: 9px 12px; border-left: 2px solid var(--brand-border); border-radius: 0 var(--radius-xs) var(--radius-xs) 0; background: var(--bg-white); box-shadow: var(--shadow-soft); color: var(--ink-body); font-size: var(--fs-sm); line-height: 1.55; }\n.inline-explain > p strong { color: var(--ink-primary); }\n\n${cssMarker}`;
r = replaceOnce(css, cssMarker, inlineCss, 'inline explanation CSS');
css = r.text; changed ||= r.changed;

const testMarker = "test('has no critical axe accessibility violations', async ({ page }) => {";
const inlineTest = `test('inline explanations stay optional and expand in place', async ({ page }) => {\n  const explainers = page.locator('.inline-explain');\n  await expect(explainers).toHaveCount(2);\n  await expect(explainers.first()).not.toHaveAttribute('open', '');\n  await explainers.first().locator('summary').click();\n  await expect(explainers.first()).toHaveAttribute('open', '');\n  await expect(explainers.first().locator('p')).toContainText('Context');\n});\n\n${testMarker}`;
r = replaceOnce(tests, testMarker, inlineTest, 'inline explanation test');
tests = r.text; changed ||= r.changed;

if (!changed) {
  console.log('No changes needed; inline explanations already present.');
  process.exit(0);
}

fs.writeFileSync('index.html', html);
fs.writeFileSync('styles.css', css);
fs.writeFileSync('tests/handbook.spec.js', tests);
console.log('Applied Nutshell-inspired inline explanations.');
