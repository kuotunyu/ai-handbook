import fs from 'node:fs';

function replaceRequired(text, from, to, label) {
  if (!text.includes(from)) throw new Error(`Could not find ${label}`);
  return text.replace(from, to);
}

function replaceRegexRequired(text, pattern, to, label) {
  if (!pattern.test(text)) throw new Error(`Could not find ${label}`);
  pattern.lastIndex = 0;
  return text.replace(pattern, to);
}

let html = fs.readFileSync('index.html', 'utf8');
let js = fs.readFileSync('app.js', 'utf8');
let css = fs.readFileSync('styles.css', 'utf8');
let tests = fs.readFileSync('tests/handbook.spec.js', 'utf8');
let agents = fs.readFileSync('AGENTS.md', 'utf8');

// 01: keep reference vocabulary, but move it off the first-read path.
html = replaceRequired(
  html,
  '<div class="keyword-group keyword-reference"><div class="keyword-group-heading"><h3>延伸詞彙</h3><p>先認識名稱與大意，遇到時再查閱細節。</p></div><div class="keyword-list">',
  '<details class="keyword-reference-disclosure" id="keyword-reference-disclosure">\n        <summary><span><strong>延伸詞彙</strong><small>AI / Generative AI / LLM / Multimodal / Token</small></span></summary>\n        <div class="keyword-group keyword-reference"><div class="keyword-group-heading"><p>遇到時再查，不必先讀完。</p></div><div class="keyword-list">',
  'reference vocabulary heading'
);
html = replaceRequired(
  html,
  '</article></div></div>\n    </section>\n\n    <!-- 02 情境 -->',
  '</article></div></div>\n      </details>\n    </section>\n\n    <!-- 02 情境 -->',
  'reference vocabulary closing'
);

// 02: this chapter chooses a starting mode; prompting belongs in chapter 04.
for (const quote of [
  '            <blockquote>「我想了解[問題]。這是手上的材料，請先解釋重點；還缺的資料，幫我找原始來源。」</blockquote>\n',
  '            <blockquote>「這是我的作業題目。我不確定要回答哪些問題，請先幫我釐清要求，再一起決定第一步。」</blockquote>\n',
  '            <blockquote>「我想把這些表格整理成[成果]。請先讀取並說明處理方式，不要修改原始檔案。」</blockquote>\n',
  '            <blockquote>「我用[軟體與版本]做[事情]，到這一步出現[錯誤訊息]。請先幫我判斷原因，再給一個可以試的步驟。」</blockquote>\n'
]) {
  html = replaceRequired(html, quote, '', 'duplicated situation prompt');
}

// 03: remove the second task-to-tool routing table and keep the unique mental model: what kind of work the AI is doing.
html = replaceRequired(
  html,
  '<p class="section-note">本文的「對話型 AI」指 Gemini、ChatGPT 或 Claude。一般提問與練習可用你習慣的一個，不必全部訂閱；換工具時沿用說明任務與核對結果的方法。</p>',
  '<p class="section-note">工具名稱會變。這章只分辨 AI 現在是在生成、搜尋、計算，還是操作檔案；不同工作要用不同方式檢查。</p>',
  'chapter 03 note'
);
html = replaceRegexRequired(
  html,
  /      <div class="table-scroll"><table class="reading-table tool-table">[\s\S]*?<\/dl>\n\n      <h3 class="compact-heading">回答方式與查核方法<\/h3>/,
  '      <h3 class="compact-heading">AI 現在是在做哪種工作？</h3>',
  'duplicated tool routing and principles'
);
html = replaceRequired(
  html,
  '      <tr><td><b>計算</b>：需要精確數值時，請它用計算器、試算表或程式運算</td><td>加總預算、算距離截止日還有幾天</td><td>核對輸入、公式與單位，再自己抽算一筆；程式跑完也可能算錯</td></tr>\n      </tbody></table></div>\n      <p><strong>可以這樣問：</strong>「請上網找這個活動今年的官方公告，附連結；找不到今年的資料就說找不到，不要拿去年的當今年的。」</p>',
  '      <tr><td><b>計算</b>：需要精確數值時，請它用計算器、試算表或程式運算</td><td>加總預算、換算租金、計算比例</td><td>核對輸入、公式與單位，再自己抽算一筆；程式跑完也可能算錯</td></tr>\n      <tr><td><b>操作</b>：使用工具讀寫檔案、執行程式或完成多步任務</td><td>整理 CSV、產生圖表、批次處理檔案</td><td>限定工作範圍、保留原檔，完成後看變更並驗收輸出</td></tr>\n      </tbody></table></div>',
  'work type table ending'
);

// 04: retain the durable idea (separate instruction from source) without teaching Markdown syntax as a prerequisite.
html = replaceRegexRequired(
  html,
  /      <h3 class="compact-heading">區分要求與原文<\/h3>[\s\S]*?      <p class="section-note">開頭與結尾各放一行 <code>```<\/code>[\s\S]*?<\/p>/,
  '      <details class="reference-disclosure" id="separate-instruction-source"><summary>材料很長時：把要求和原文分開</summary><p>先寫你要 AI 做什麼，再清楚標示「以下是原文／資料」。不必背特殊符號；重點是讓要求與待處理材料有明確邊界。</p></details>',
  'backtick syntax lesson'
);

// 05: keep one sample-bias animation and the stronger PDF source-verification exercise; remove the duplicate evidence animation.
html = replaceRequired(
  html,
  '<p>下面兩段動畫沿用上方短文。展開後先自己判斷，再播放；看完試著解釋理由，最後展開文字解說核對。不看影片也可以直接讀文字。</p>',
  '<p>先用一個樣本判讀練習確認「百分比代表誰」，再用下方原始 PDF 練習查證主張。需要時才展開，不必一次做完。</p>',
  'reading practice intro'
);
html = replaceRegexRequired(
  html,
  /        <details class="learning-lesson" id="lesson-evidence">[\s\S]*?        <\/details>\n      <\/div>\n      <details class="evidence-pdf-lab"/,
  '      </div>\n      <details class="evidence-pdf-lab"',
  'duplicate evidence animation lesson'
);
html = replaceRegexRequired(
  html,
  /      <h3 class="compact-heading">輸出形式與用途<\/h3>[\s\S]*?      <p>語音導覽、資訊圖表與簡報的可編輯範例，集中在第九章「提示詞範例」。<\/p>/,
  '      <details class="reference-disclosure" id="notebooklm-output"><summary>NotebookLM 其他輸出形式（需要時再看）</summary><p>語音導覽、心智圖、資訊圖表、簡報與報告可以當作複習或表達的輔助。功能與介面會變；使用時只選真正有幫助的一種，生成後仍回來源核對重要內容。</p></details>',
  'NotebookLM feature table'
);

// 06: keep a tiny product choice, replace two duplicated product walkthroughs with one durable three-step method.
html = replaceRegexRequired(
  html,
  /          <h3 class="compact-heading">工具選擇<\/h3>[\s\S]*?        <\/div>\n        <div class="agent-col flow">/,
  '          <h3 class="compact-heading">工具選擇</h3>\n          <p>Codex 或 Claude Code 都可以；用你目前可用的一個，不必同時學兩套介面。</p>\n        </div>\n        <div class="agent-col flow">',
  'agent tool switch'
);
html = replaceRegexRequired(
  html,
  /      <div class="tool-panel" data-tool-panel="codex" hidden>[\s\S]*?      <\/details>\n\n      <div class="rent-task" id="rent-task">/,
  '      <div class="agent-tool-guide">\n        <h3 class="compact-heading">用哪個 Agent 都先做這三件事</h3>\n        <ol class="step-list">\n          <li><strong>開工作範圍</strong><span>用練習資料夾開始，真實任務先在工作範圍外保留原檔備份。</span></li>\n          <li><strong>確認權限與第一步</strong><span>先確認哪些檔案可讀、可改；第一次要求只讀取並回報，不要立刻修改。</span></li>\n          <li><strong>看變更並驗收</strong><span>執行後看它改了哪些檔案，再打開 output 與關鍵數字核對；只相信實際檔案，不只相信「已完成」。</span></li>\n        </ol>\n        <p class="source-note">介面名稱會變，方法不變。需要安裝時回官方入口：<a href="https://openai.com/codex/" target="_blank" rel="noopener">Codex</a>、<a href="https://claude.com/download" target="_blank" rel="noopener">Claude Code</a>。</p>\n      </div>\n\n      <div class="rent-task" id="rent-task">',
  'duplicated Codex and Claude walkthroughs'
);

// 06: the unit Plot now does the teaching; keep only a short verification disclosure instead of a second Manim treatment.
html = replaceRegexRequired(
  html,
  /        <details class="learning-lesson" id="lesson-units">[\s\S]*?        <\/details>\n        <details class="learning-lesson" id="lesson-missing">/,
  `        <details class="learning-lesson" id="lesson-units">
          <summary>資料單位與比較結果<span class="lesson-topic">先統一比較基準</span></summary>
          <div class="lesson-content">
            <p class="lesson-question"><strong>先判斷：</strong>舊城區 D2 是 £280／週，河岸區 D1 是 £1,200／月。哪一區比較便宜？</p>
            <div class="plot-lab" id="unitsPlotLab">
              <div class="plot-lab-head"><strong>互動試試</strong><span>同兩筆資料，只改「有沒有先統一單位」。</span></div>
              <div class="plot-lab-controls" role="group" aria-label="租金比較方式">
                <button type="button" class="plot-mode" data-unit-mode="raw" aria-pressed="true">直接比 280 和 1,200（錯誤）</button>
                <button type="button" class="plot-mode" data-unit-mode="monthly" aria-pressed="false">先換成月租</button>
              </div>
              <div class="plot-lab-chart" id="unitsPlot" aria-live="polite"><p class="plot-loading">載入互動圖…</p></div>
              <p class="plot-lab-takeaway" id="unitsPlotTakeaway"><strong>不能直接比。</strong>280 是每週，1,200 是每月；數字看起來差很多，不代表 D2 比較便宜。</p>
            </div>
            <details class="lesson-answer"><summary>核對換算方式</summary><p>本練習用每週租金 × 52 ÷ 12 換算平均月租：£280／週約為 £1,213.33／月。交給 AI 時，先確認原始單位、轉換公式與原欄位都有保留，再自己抽算一筆。</p></details>
          </div>
        </details>
        <details class="learning-lesson" id="lesson-missing">`,
  'duplicated unit animation lesson'
);

// 07: one editor, one short set of instructions, and one durable chart-choice prompt.
html = replaceRequired(
  html,
  '      <div class="mermaid-actions">\n        <a class="btn primary" href="https://mermaid.live/edit" target="_blank" rel="noopener">Mermaid Live Editor</a>\n        <a class="btn ghost" href="https://mermaid.ai/live/edit" target="_blank" rel="noopener">mermaid.ai 編輯器</a>\n      </div>\n      <p class="mermaid-hint">打開編輯器後，把左邊 Code 區原本的內容全選刪掉，貼上剛複製的 code，右邊就會出圖。</p>\n      <p>要改就用白話說：改成橫向、字縮短、加一條回頭的箭頭。<strong>貼上去報錯？</strong>把錯誤訊息原封不動丟回給 AI，請它修正後重給完整 code。</p>',
  '      <div class="mermaid-actions">\n        <a class="btn primary" href="https://mermaid.live/edit" target="_blank" rel="noopener">Mermaid Live Editor</a>\n      </div>\n      <p class="mermaid-hint">把 AI 給的 code 貼進編輯器即可預覽。要修改或遇到錯誤時，把需求或錯誤訊息原樣交回 AI，再核對完整圖。</p>',
  'duplicate Mermaid editor instructions'
);
html = replaceRegexRequired(
  html,
  /<div class="side-by-side split-wide-left">[\s\S]*?<\/div>\n<\/div>\n    <\/section>\n\n    <!-- 08 規則 -->/,
  `<h3 class="compact-heading">圖表類型的選擇</h3>
      <p>先講目的和讀者，讓 AI 建議圖種並說理由；你確認關係表達正確後，再請它產生 code。</p>
      <div class="pbox"><div class="pbox-head"><span>貼給對話型 AI</span><button class="copy-btn" type="button" data-copy-target="#choosePrompt">複製</button></div><pre id="choosePrompt">我想在報告裡說明「[一件事，例如制度層級與在地條件怎麼影響住宅負擔]」，讀者是[誰，例如 seminar 同學]，他們要一眼看懂的是[什麼]。
請先建議最適合的圖表類型，說明為什麼，也說一個不建議的類型和原因。
我確認後，再給 Mermaid code：節點用中文、保留英文術語，只回傳 code。</pre></div>
      <p class="source-note">精確數據圖先核對數值、單位與刻度；空間資料則回到 GIS 或 Agent 工作流程。</p>
    </section>

    <!-- 08 規則 -->`,
  'duplicated chart-tool guidance'
);

// 09: keep durable prompt patterns; remove feature-specific NotebookLM recipes.
for (const title of ['整理課堂錄音', '製作語音導覽', '製作資訊圖表或簡報']) {
  const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp('  \\{\\n    "title": "' + escaped + '",[\\s\\S]*?  \\},\\n');
  js = replaceRegexRequired(js, pattern, '', `feature-specific prompt card: ${title}`);
}

// Remove now-dead product-switch JavaScript.
js = replaceRegexRequired(
  js,
  /\nconst TOOL_LABELS = \{ codex: "Codex", claude: "Claude Code" \};[\s\S]*?\n}\n\n\/\* ====================================================================\n   05 延伸：PDF\.js/,
  '\n\n/* ====================================================================\n   05 延伸：PDF.js',
  'agent tool switch JavaScript'
);
js = replaceRequired(js, 'setupToolSwitch();\n', '', 'setupToolSwitch startup call');

// Layered reference styling: secondary information should look optional, not like another full chapter.
const cssAnchor = '/* ============ 01 關鍵字：四張核心卡、五列延伸詞 ============ */';
const cssInsert = `/* ============ 01 關鍵字：核心先讀，延伸詞彙按需展開 ============ */
.keyword-reference-disclosure { margin: 18px 0 0; border-top: 1px solid var(--border-subtle); padding-top: 10px; }
.keyword-reference-disclosure > summary { min-height: 44px; color: var(--ink-primary); }
.keyword-reference-disclosure > summary > span { display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px 14px; }
.keyword-reference-disclosure > summary strong { font-size: var(--fs-h3); }
.keyword-reference-disclosure > summary small { color: var(--ink-muted); font-size: var(--fs-sm); font-weight: 500; }
.keyword-reference-disclosure > .keyword-group { padding-top: 0; }
.keyword-reference-disclosure .keyword-group-heading { margin: 8px 0 10px 32px; }
.reference-disclosure { margin: 16px 0; padding: 8px 14px 10px; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); background: var(--bg-tint); }
.reference-disclosure > summary { color: var(--ink-primary); }
.reference-disclosure > p { max-width: 70ch; margin-bottom: 4px; }

`;
css = replaceRequired(css, cssAnchor, cssInsert + cssAnchor, 'keyword CSS anchor');
css = css.replace('/* ============ 01 關鍵字：四張核心卡、五列延伸詞 ============ */', '/* ============ 01 關鍵字：五張核心卡、延伸詞彙參考列 ============ */');

// Tests: drop the product-specific switch test and assert progressive disclosure remains optional.
tests = replaceRegexRequired(
  tests,
  /test\('tool switch shows only the selected agent instructions',[\s\S]*?\n}\);\n\n/,
  '',
  'tool switch test'
);
const navTest = `test('core chapter navigation targets exist', async ({ page }) => {\n  const targets = ['keywords', 'situations', 'concepts', 'prompt', 'reading', 'agent', 'diagrams', 'rules', 'cards'];\n  for (const id of targets) {\n    await expect(page.locator(\`#\${id}\`)).toHaveCount(1);\n    await expect(page.locator(\`#topnav a[href="#\${id}"]\`)).toHaveCount(1);\n  }\n});`;
const layeredTest = `${navTest}\n\ntest('secondary reference material stays off the first-read path', async ({ page }) => {\n  const glossary = page.locator('#keyword-reference-disclosure');\n  const outputs = page.locator('#notebooklm-output');\n  await expect(glossary).not.toHaveAttribute('open', '');\n  await expect(outputs).not.toHaveAttribute('open', '');\n  await glossary.locator(':scope > summary').click();\n  await expect(glossary).toHaveAttribute('open', '');\n  await expect(page.locator('#keyword-token')).toBeVisible();\n  await expect(page.locator('#situations blockquote')).toHaveCount(0);\n  await expect(page.locator('#concepts .tool-table')).toHaveCount(0);\n});`;
tests = replaceRequired(tests, navTest, layeredTest, 'navigation test insertion point');

// Guard against future agents rebuilding the same duplication.
const guardrailAnchor = '- PDF.js is used at runtime for one source-verification exercise; do not turn the handbook into a general PDF reader. Citation.js formats the known bibliography at authoring/build time only, so the browser does not download its large bundle. Citation formatting is not evidence validation.';
const guardrailAddition = `${guardrailAnchor}\n- Keep chapter roles distinct: chapter 02 chooses a starting work mode; chapter 03 explains generation/search/calculation/operation and verification; chapter 04 teaches task handoff. Do not reintroduce full prompt examples into chapter 02 or a second task-to-tool routing table into chapter 03.\n- Agent guidance should teach scope, permissions, reversibility and verification once. Product-specific UI steps may be brief references, not parallel long walkthroughs.`;
agents = replaceRequired(agents, guardrailAnchor, guardrailAddition, 'subtractive refactor guardrails');

fs.writeFileSync('index.html', html);
fs.writeFileSync('app.js', js);
fs.writeFileSync('styles.css', css);
fs.writeFileSync('tests/handbook.spec.js', tests);
fs.writeFileSync('AGENTS.md', agents);

console.log('Applied subtractive refactor: removed duplicated guidance while preserving deep reference paths.');
