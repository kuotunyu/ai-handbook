import fs from 'node:fs';

const path = 'index.html';
let html = fs.readFileSync(path, 'utf8');
let changed = false;

function replaceOnce(from, to, label) {
  if (html.includes(to)) return;
  if (!html.includes(from)) throw new Error(`Could not find insertion point: ${label}`);
  html = html.replace(from, to);
  changed = true;
}

replaceOnce(
  '<p class="section-note">九個詞，不用背定義。先看核心四個，再到使用情境選一件事試。</p>',
  '<p class="section-note">不用背定義。先看核心概念；延伸詞彙遇到時再查。</p>',
  'keyword section note'
);

replaceOnce(
  '<article class="keyword-entry" id="keyword-hallucination">',
  `<article class="keyword-entry" id="keyword-training">\n            <h4>Training<span class="keyword-alias">訓練</span></h4>\n            <p class="keyword-definition">用資料更新模型本身的參數，讓模型的行為改變。</p>\n            <p class="keyword-action"><strong>使用要點</strong>把履歷、背景、文件貼進聊天，通常是在提供 Context，不是在訓練模型。</p>\n            <details class="keyword-example"><summary>看例子<span class="sr-only">：Training</span></summary><p>例如告訴 Gemini「我是都市計畫研究生，請用初學者能懂的方式解釋 GIS」，這是在提供這次工作的 Context。只有真的用資料去更新模型本身時，才是在談 training 或 fine-tuning。</p></details>\n          </article>\n<article class="keyword-entry" id="keyword-hallucination">`,
  'training keyword'
);

const decisionBlock = `\n      <div class="decision-practice" id="decision-practice">\n        <h3 class="compact-heading">先判斷，再展開</h3>\n        <p>不用背答案。先在心裡選一個，再打開看判斷依據。</p>\n        <div class="situation-list">\n          <details class="situation-entry">\n            <summary><span class="situation-name">教授給你 15 篇指定 paper，要比較作者觀點。第一個用什麼？</span><span class="situation-examples">對話型 AI / NotebookLM / Agent</span></summary>\n            <div class="situation-content"><p><strong>判斷依據：NotebookLM。</strong>核心工作是圍繞一批指定來源閱讀、比較與回查，不是讓 Agent 操作檔案。最後仍要打開原文確認引用真的支持你的說法。</p></div>\n          </details>\n          <details class="situation-entry">\n            <summary><span class="situation-name">把履歷、背景和作業要求貼給 Gemini，這是在「訓練 AI」嗎？</span><span class="situation-examples">Training / Context</span></summary>\n            <div class="situation-content"><p><strong>判斷依據：這是在提供 Context。</strong>你是在告訴既有模型這次工作要參考什麼；模型本身沒有因此被重新訓練。</p></div>\n          </details>\n          <details class="situation-entry">\n            <summary><span class="situation-name">AI 給你一篇論文引用和一個漂亮的 18% 數字，下一步？</span><span class="situation-examples">直接引用 / 回原文核對 / 換一個模型再問</span></summary>\n            <div class="situation-content"><p><strong>判斷依據：回原始來源核對。</strong>有 citation 不等於 citation 支持整句話；先確認作者、年份、數字、研究對象與原文語意，再決定能不能使用。</p></div>\n          </details>\n          <details class="situation-entry">\n            <summary><span class="situation-name">你有 CSV 和 GeoJSON，要整理資料、做圖並輸出新檔。用哪種工作模式？</span><span class="situation-examples">聊天 / NotebookLM / Agent</span></summary>\n            <div class="situation-content"><p><strong>判斷依據：Agent。</strong>這已經不是只要答案，而是要 AI 實際處理檔案。先保留 raw data、限定工作範圍，讓它說明方法，再核對輸出。</p></div>\n          </details>\n        </div>\n      </div>\n`;

replaceOnce(
  '      <p class="situation-reference">需要時再查：',
  `${decisionBlock}      <p class="situation-reference">需要時再查：`,
  'decision practice'
);

if (changed) {
  fs.writeFileSync(path, html);
  console.log('Applied learning improvements to index.html');
} else {
  console.log('No changes needed; improvements already present');
}
