# 研究所 AI 手冊：Learning Experience Audit

## 目的

這份手冊的成功標準不是「內容很多」或「互動很多」，而是使用者在真正遇到研究所問題時，能自行判斷：

1. 我現在要理解、找資料、讀一批來源，還是讓 AI 動手處理檔案？
2. 我該給 AI 哪些 Context？
3. 什麼時候應該用對話型 AI、NotebookLM、Agent？
4. 哪些答案需要回原始來源驗證？
5. AI 可以幫我做很多操作，但最後哪一些判斷仍由我負責？

以下建議以「降低認知負荷」為最高原則。

---

## A. 目前做得好的事情

### 1. 首頁已經有很好的三分法

「聊和查 / 讀 / 動手」比直接介紹品牌更容易形成長期 mental model。產品會改名，但任務型態不容易過時。

### 2. 使用情境先於功能細節

「理解與查找資料 / 準備作業與表達 / 處理資料 / 操作問題」是正確方向。使用者通常先知道自己卡在哪裡，而不是先知道某個 AI 功能名稱。

### 3. Prompt 章節沒有把 prompting 變成咒語

目前用積木呈現「目標、背景、限制、驗收條件」比提供 100 個 prompt 模板更有教育價值。這在教交代工作，而不是背 prompt engineering 技巧。

### 4. 文獻閱讀章節有主動判讀

樣本、單位、引用與主張等練習要求使用者先自己判斷，再展開答案。這種 active recall 值得保留，而且比再增加更多動畫更重要。

### 5. Agent 章節已經強調範圍、原檔與驗收

這比教大量 CLI 指令更適合非工程背景學生，也能建立未來使用任何 Agent 都適用的安全習慣。

---

## B. 目前最大的認知負荷風險

### 1. 第一章的延伸詞彙可能太早出現

AI、生成式 AI、LLM、多模態、Token 對完整理解有幫助，但新使用者第一次進站不一定需要先讀完。核心概念應保持明顯層級；延伸詞彙維持「需要時再查」的參考定位。

### 2. 工具選擇在首頁、使用情境、工具與功能三處重複

適量重複可以強化記憶，但如果文字太相似，就會讓使用者覺得一直在讀同一件事。情境判斷已加入後，未來若再增加內容，優先刪短重複的工具選擇說明，而不是繼續疊加。

### 3. 第五章內容密度高

文獻閱讀、資料判讀、NotebookLM 筆記本建立、引用格式、輸出形式都集中在一章。這章很有價值，但應持續使用 progressive disclosure，避免讓第一次閱讀的人覺得每一項都必須現在學會。

### 4. Product-specific 操作步驟容易老化

Codex / Claude Code 的安裝、按鈕和方案細節可能很快改變。應只保留會影響安全與工作方式的步驟，把容易過期的 UI 指令控制在最少。

### 5. 動畫如果持續增加，容易從「解釋」變成「展示」

目前動畫最值得存在的地方是：不靠 motion 很難理解、或可以一眼看見錯誤推論的概念。未來每支新動畫都應回答：「沒有這支動畫，使用者會少理解什麼？」

---

## C. 目前已完成的第一輪前台改進

### 1. `Context ≠ Training`

第一章已新增 `Training`，並把最重要的判斷寫清楚：

- 把履歷、背景、文件貼進聊天，通常是在提供 **Context**；
- 用資料更新模型本身的參數，才是在談 **Training**；
- 不要求使用者一次記住 pretraining、fine-tuning 等更多術語。

### 2. 四個「先判斷，再展開」情境

第二章加入四個無分數、無 gamification 的 active-recall 檢查：

1. 指定多篇 paper → NotebookLM；
2. 貼背景資料 → Context，不是 Training；
3. AI 給 citation / 數字 → 回原始來源核對；
4. CSV + GeoJSON 要實際產出新檔 → Agent，並保留 raw data、限定範圍與驗收。

這些互動沿用原生 `details/summary`，沒有新增 JavaScript 或 production dependency。

---

## D. 接下來的優先順序

### Priority 1 — 觀察這一輪是否真的改善理解

先不要再增加 quiz 類互動。若使用者能用自己的話回答：

- Context 和 Training 差在哪？
- 何時用 NotebookLM，何時用 Agent？
- 為什麼 citation 不是驗證完成？

就代表這一輪已達到目的。

### Priority 2 — 少量核心詞彙原地解釋

只對「忘記會妨礙當下理解」的詞做少量 progressive disclosure，例如 Context、Agent、Training。不要把所有英文術語做成可點連結。

### Priority 3 — 下一支動畫只做高價值 misconception

最值得的候選仍是 **Training ≠ Context**。只有在靜態文字仍不足以留下 mental model 時才做 Manim；動畫應簡短、無旁白也看得懂、不可 autoplay。

### Priority 4 — 持續維護 Agent quality harness

使用者看不到，但能避免 Codex / Claude Code 修改 A 時弄壞 B。最低需求：核心 anchor、主要互動、Console errors、手機 viewport、accessibility。

---

## E. 十分鐘理想閱讀路徑

若使用者只願意花約十分鐘：

1. 首頁：「聊和查 / 讀 / 動手」三分法。
2. 第一章：Prompt、Context、Training、幻覺、Agent。
3. 第二章：先找一個最像自己的使用情境，再做四個快速判斷。
4. 第四章：Prompt 不用背，先說目標、給材料，再補限制與驗收。
5. 第五章：AI 可以幫忙讀，但來源與證據要回原文。
6. 第六章：Agent 是「會動手的 AI」，因此要限定範圍、保留原檔、驗收結果。

剩餘章節當 reference 使用，不要求第一次全部讀完。

---

## F. 現在不需要增加的功能

暫不建議：

- AI chatbot；
- 使用者帳號；
- 大量 quiz / gamification；
- 更多 Agent 產品比較；
- model benchmark 排行；
- 即時 Python notebook；
- GIS web lab；
- onboarding tour；
- React / Vue / Next / Astro migration；
- 每個術語都做 tooltip；
- 為了「看起來厲害」增加動畫。

等真實使用情境證明有需求再加入。

---

## 每次新增功能前問三個問題

1. 這個功能會讓使用者多建立哪一個重要的 mental model？
2. 不做這個功能，只用一句更好的文字能不能達到同樣效果？
3. 加完之後，可以刪掉哪一段原本的說明？

如果第二題答案是「可以」，優先改文字。
