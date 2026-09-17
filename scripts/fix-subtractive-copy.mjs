import fs from 'node:fs';
let html = fs.readFileSync('index.html', 'utf8');
const replacements = [
  ['<figcaption>示意取自本章動畫；實際輸出由 Agent 產生，D4 會標示無資料。</figcaption>', '<figcaption>示意取自本章練習；實際輸出由 Agent 產生，D4 會標示無資料。</figcaption>'],
  ['<p>下面兩段動畫使用同一份租金資料與抽象格網。先判斷處理方式，再看數字與地圖如何改變，最後說明你會怎麼驗收 AI 的輸出。</p>', '<p>下面兩個練習使用同一份租金資料與抽象格網。先判斷處理方式，再看數字與地圖如何改變，最後說明你會怎麼驗收 AI 的輸出。</p>']
];
for (const [from, to] of replacements) {
  if (!html.includes(from)) throw new Error('Expected copy not found: ' + from.slice(0, 60));
  html = html.replace(from, to);
}
fs.writeFileSync('index.html', html);
console.log('Aligned copy with the simplified interaction set.');
