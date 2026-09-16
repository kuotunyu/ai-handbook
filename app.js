/* ====================================================================
   研究所 AI 手冊 — 單頁互動教學
   無外部依賴，file:// 直接開即可。
==================================================================== */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const STORE_KEY = "ai-handbook-v3";

function loadStore() { try { return JSON.parse(localStorage.getItem(STORE_KEY) || "{}") || {}; } catch (e) { return {}; } }
function saveStore(patch) { try { localStorage.setItem(STORE_KEY, JSON.stringify({ ...loadStore(), ...patch })); } catch (e) { /* storage unavailable: keep working */ } }

/* ---------- 共用：複製 + toast ---------- */
function showToast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => t.classList.remove("show"), 1600);
}

function copyText(text, btn) {
  const done = () => {
    showToast("已複製，記得換成自己的材料。");
    if (btn) {
      btn.classList.add("copied");
      const old = btn.textContent;
      btn.textContent = "已複製";
      setTimeout(() => { btn.classList.remove("copied"); btn.textContent = old; }, 1500);
    }
  };
  const fallback = () => {
    const active = document.activeElement;
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    let copied = false;
    try { copied = document.execCommand("copy"); } catch (e) { /* use manual selection */ }
    ta.remove();
    if (active instanceof HTMLElement) active.focus({ preventScroll: true });
    if (copied) done();
    else {
      const panel = btn?.closest(".prompt-example, .builder-output, .pbox, .reading-source");
      const editor = panel?.querySelector("textarea");
      if (editor) { editor.focus({ preventScroll: true }); editor.select(); }
      showToast("無法自動複製，請選取內容後手動複製。");
    }
  };
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(done).catch(fallback);
  } else fallback();
}

/* 文字框跟著內容長高，不要在小框裡捲動 */
function autoGrow(editor) {
  editor.style.height = "auto";
  editor.style.height = editor.scrollHeight + 2 + "px";
}

/* 任何 data-copy-target="#id" 的按鈕都能複製對應元素的文字 */
function setupCopyTargets() {
  document.addEventListener("click", e => {
    const btn = e.target.closest("[data-copy-target]");
    if (!btn) return;
    const el = $(btn.dataset.copyTarget);
    if (el) copyText(el.innerText || el.textContent, btn);
  });
}

/* ====================================================================
   04 Prompt 組裝器（兩套公式）
==================================================================== */
const FORMULAS = [
  {
    label: "想搞懂一件事",
    hint: "想「搞懂一件事」的時候用。範例情境：研究所的 seminar 要怎麼準備？",
    empty: "（先選目標就能開始，再依回答補充需要的資訊。）",
    joiner: "\n",
    blocks: [
      { name: "身分", desc: "我是誰？AI 該扮演誰？", text: "我是研究所學生。請像學長姐一樣回答我。", on: false },
      { name: "目標", desc: "我到底想得到什麼？", text: "幫我理解研究所的 seminar 要怎麼準備。", on: true },
      { name: "背景", desc: "AI 需要知道我的什麼情況？", text: "我還不熟悉 seminar 的討論方式，也擔心用英文發言。", on: false },
      { name: "限制", desc: "範圍多大？不要什麼？", text: "以研究所的課堂討論為範圍。請用繁體中文，語氣自然不要太學術。", on: false },
      { name: "輸出格式", desc: "要列點？表格？分幾段？", text: "請分成：1. 課前準備 2. 討論時怎麼開口 3. 跟大學課堂的差異 4. 新生容易遇到的困難 5. AI 可以幫忙的地方 6. 哪些能力仍然要自己練。", on: false },
      { name: "查證要求", desc: "哪些要標示不確定？", text: "不確定是否每間學校都一樣的地方，請標示「需要查證」。我會再確認學校或課程的實際要求。", on: false }
    ]
  },
  {
    label: "想做出一個東西",
    hint: "要 AI「幫你做出一個東西」的時候用。範例情境：迎新要用的英文自我介紹。",
    empty: "（先選期待，說明你想做出什麼，再補上材料與完成條件。）",
    joiner: "\n\n",
    blocks: [
      { name: "現況", desc: "你現在的情況、手上有什麼", text: "# 現況\n我下個月開學，系上迎新要每個人用英文自我介紹一分鐘。", on: false },
      { name: "痛點", desc: "卡在哪、為什麼困擾", text: "# 痛點\n我自己寫的稿子像在背課文，唸起來很僵硬，遇到難字還會結巴。", on: false },
      { name: "期待", desc: "你想得到什麼", text: "# 期待\n幫我寫一份聽起來自然、像在聊天的英文自介稿，附中文對照。", on: true },
      { name: "驗收條件", desc: "怎樣算合格？給可檢查的標準", text: "# 驗收條件\n- 約 100–120 個英文單字，再實際朗讀計時調整\n- 不要出現太難唸的字\n- 結尾留一句讓人記得住的話", on: false },
      { name: "指定解法", desc: "希望它怎麼做事", text: "# 指定解法\n先給我 3 種不同風格的開場（幽默／誠懇／簡潔）讓我選，選定後再寫完整版。", on: false },
      { name: "範例資料", desc: "把你的資料、例子貼給它", text: "# 範例資料\n我的資料：（示範人物）小陳、來自台灣、喜歡散步和攝影、即將讀研究所。請換成自己的資料。", on: false }
    ]
  }
];

function renderBuilder() {
  const tabsBox = $("#formulaTabs");
  const hintBox = $("#formulaHint");
  const box = $("#builderBlocks");
  const result = $("#builderResult");
  let cur = 0;
  const stripHeading = text => text.replace(/^# [^\n]+\n/, "");
  const defaults = FORMULAS.map(f => f.blocks.map(b => b.on));
  const drafts = FORMULAS.map(f => f.blocks.map(b => stripHeading(b.text)));
  function copyContent() {
    const f = FORMULAS[cur];
    return f.blocks.flatMap((b, i) => {
      const value = drafts[cur][i];
      if (!b.on || !value.trim()) return [];
      const heading = b.text.match(/^# [^\n]+\n/);
      return [(heading ? heading[0] : "") + value];
    }).join(f.joiner);
  }
  const fitEditor = autoGrow;
  function compose() {
    const f = FORMULAS[cur];
    const lines = f.blocks.filter(b => b.on).map(b => b.text);
    if (lines.length === 0) { result.innerHTML = `<span class="placeholder">${f.empty}</span>`; return ""; }
    const text = lines.join(f.joiner);
    result.replaceChildren();
    f.blocks.forEach((b, i) => {
      if (!b.on) return;
      const part = document.createElement("span");
      part.className = "prompt-part";
      part.dataset.i = String(i);
      const label = document.createElement("label");
      label.className = "prompt-label";
      label.textContent = b.name;
      const body = document.createElement("textarea");
      body.className = "prompt-text";
      body.id = `prompt-edit-${cur}-${i}`;
      label.htmlFor = body.id;
      body.rows = 2;
      body.value = drafts[cur][i];
      body.placeholder = "在這裡輸入你的內容";
      body.addEventListener("input", () => {
        drafts[cur][i] = body.value;
        fitEditor(body);
      });
      part.append(label, body);
      result.append(part);
      fitEditor(body);
    });
    return text;
  }
  function renderBlocks() {
    const f = FORMULAS[cur];
    hintBox.textContent = f.hint;
    box.innerHTML = f.blocks.map((b, i) => `<button class="block-btn${b.on ? " on" : ""}" type="button" data-i="${i}" aria-pressed="${b.on}"><span class="block-name">${b.name}</span><span class="block-desc">${b.desc}</span></button>`).join("");
    compose();
  }
  tabsBox.innerHTML = FORMULAS.map((f, i) => `<button class="formula-tab${i === 0 ? " active" : ""}" type="button" data-i="${i}" aria-pressed="${i === 0}">${f.label}</button>`).join("");
  const builderEl = $(".builder");
  tabsBox.addEventListener("click", e => { const btn = e.target.closest(".formula-tab"); if (!btn) return; cur = +btn.dataset.i; if (builderEl) builderEl.dataset.formula = String(cur); $$(".formula-tab", tabsBox).forEach(t => { t.classList.toggle("active", t === btn); t.setAttribute("aria-pressed", String(t === btn)); }); renderBlocks(); });
  if (builderEl) builderEl.dataset.formula = "0";
  box.addEventListener("click", e => { const btn = e.target.closest(".block-btn"); if (!btn) return; const b = FORMULAS[cur].blocks[+btn.dataset.i]; b.on = !b.on; btn.classList.toggle("on", b.on); btn.setAttribute("aria-pressed", String(b.on)); compose(); });
  $("#builderCopy").addEventListener("click", e => { const text = copyContent(); if (!text) { showToast("先選一塊積木並輸入內容。"); return; } copyText(text, e.currentTarget); });
  $("#builderReset").addEventListener("click", () => {
    FORMULAS[cur].blocks.forEach((b, i) => { b.on = defaults[cur][i]; });
    drafts[cur] = FORMULAS[cur].blocks.map(b => stripHeading(b.text));
    renderBlocks();
    showToast("已還原成範例。");
  });
  renderBlocks();
  new ResizeObserver(() => $$("textarea", result).forEach(fitEditor)).observe(result);
}

/* ====================================================================
   06 Agent：示意步驟 + 這個月用哪個
==================================================================== */
const AGENT_STEPS = [
  { who: "ai", text: "讀取三份文件", note: "找出作業要求與截止日，記錄檔名和頁碼；讀不到的頁面列出來。" },
  { who: "ai", text: "整理並找出衝突", note: "同一份報告在第 2 頁寫 10/18，第 5 頁卻寫 10/20，先標成待確認。" },
  { who: "you", text: "補充關鍵資訊", note: "提供老師更新的公告，確認報告截止日是 10/20。" },
  { who: "ai", text: "產出表格並檢查", note: "更新日期、記錄公告來源、依日期排序，檢查漏項後另存 assignments.csv。" },
  { who: "you", text: "打開成果核對", note: "對照原文件與公告，確認截止日正確，再拿來安排進度。" }
];

function renderAgent() {
  const box = $("#agentSteps");
  let pos = 0;
  box.innerHTML = AGENT_STEPS.map((s, i) => `<div class="agent-step future" data-i="${i}"><span class="who ${s.who}">${s.who === "you" ? "你" : "AI"}</span><span><strong>${s.text}</strong><span class="step-note">${s.note}</span></span></div>`).join("");
  const steps = $$(".agent-step", box);
  const nextBtn = $("#agentNext");
  function update() {
    steps.forEach((el, i) => { el.classList.toggle("future", i > pos); el.classList.toggle("now", i === pos); });
    nextBtn.textContent = pos >= AGENT_STEPS.length - 1 ? "完成" : "下一步";
    nextBtn.disabled = pos >= AGENT_STEPS.length - 1;
  }
  nextBtn.addEventListener("click", () => { if (pos < AGENT_STEPS.length - 1) { pos++; update(); } });
  $("#agentReset").addEventListener("click", () => { pos = 0; update(); });
  update();
}

const TOOL_LABELS = { codex: "Codex", claude: "Claude Code" };
function setupToolSwitch() {
  const buttons = $$("[data-tool]");
  if (!buttons.length) return;
  const status = $("#toolStatus");
  function apply(tool) {
    buttons.forEach((b, i) => {
      const selected = b.dataset.tool === tool;
      b.setAttribute("aria-checked", String(selected));
      b.tabIndex = selected || (!tool && i === 0) ? 0 : -1;
    });
    $$("[data-tool-panel]").forEach(p => { p.hidden = p.dataset.toolPanel !== tool; });
    if (status) status.textContent = tool ? `目前顯示 ${TOOL_LABELS[tool]} 的步驟。換訂閱時再回來改。` : "先選一個，下面只顯示那一套步驟。換訂閱時再回來改。";
  }
  buttons.forEach(b => b.addEventListener("click", () => { saveStore({ agentTool: b.dataset.tool }); apply(b.dataset.tool); }));
  $(".tool-switch").addEventListener("keydown", e => {
    const index = buttons.indexOf(document.activeElement);
    if (index < 0 || !["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const next = e.key === "Home" ? 0 : e.key === "End" ? buttons.length - 1 : (index + (["ArrowRight", "ArrowDown"].includes(e.key) ? 1 : -1) + buttons.length) % buttons.length;
    buttons[next].click(); buttons[next].focus();
  });
  const saved = loadStore().agentTool;
  apply(TOOL_LABELS[saved] ? saved : null);
}

/* ====================================================================
   07 圖表：分頁即決策表，一次看一張
==================================================================== */
function renderDiagrams() {
  const list = window.DIAGRAMS || [];
  const tabs = $("#diagramTabs");
  if (!tabs || !list.length) return;
  tabs.innerHTML = list.map((d, i) => `<button type="button" class="diagram-tab${i ? "" : " active"}" id="diagram-tab-${d.id}" aria-controls="diagramPanel" role="tab" tabindex="${i ? -1 : 0}" aria-selected="${i ? "false" : "true"}" data-diagram="${d.id}"><b>${d.name}</b><span>${d.when}</span></button>`).join("");
  function show(id) {
    const d = list.find(x => x.id === id);
    if (!d) return;
    $("#diagramImg").src = `diagrams/${d.id}.svg`;
    $("#diagramImg").alt = `${d.name}範例`;
    $("#diagramCaption").innerHTML = `<strong>${d.name}</strong> · 例：${d.example}`;
    $("#diagramSay").textContent = d.say;
    $("#diagramTweak").textContent = `常見微調：${d.tweak}`;
    $("#diagramCode").textContent = d.code;
    $("#diagramPanel").setAttribute("aria-labelledby", `diagram-tab-${d.id}`);
    $$(".diagram-tab", tabs).forEach(t => { const on = t.dataset.diagram === id; t.classList.toggle("active", on); t.setAttribute("aria-selected", String(on)); t.tabIndex = on ? 0 : -1; });
  }
  tabs.addEventListener("click", e => { const btn = e.target.closest(".diagram-tab"); if (btn) show(btn.dataset.diagram); });
  tabs.addEventListener("keydown", e => {
    const buttons = $$(".diagram-tab", tabs), index = buttons.indexOf(document.activeElement);
    if (index < 0 || !["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const next = e.key === "Home" ? 0 : e.key === "End" ? buttons.length - 1 : (index + (e.key === "ArrowRight" ? 1 : -1) + buttons.length) % buttons.length;
    show(buttons[next].dataset.diagram); buttons[next].focus({ preventScroll: true });
    buttons[next].scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" });
  });
  const dialog = $("#diagramZoom"), scaleBtn = $("#diagramZoomScale");
  const setScale = actual => {
    dialog.classList.toggle("actual", actual);
    scaleBtn.setAttribute("aria-pressed", String(actual));
    scaleBtn.textContent = actual ? "整張檢視" : "1:1 檢視";
  };
  scaleBtn.addEventListener("click", () => setScale(!dialog.classList.contains("actual")));
  $("#diagramZoomOpen").addEventListener("click", () => {
    const source = $("#diagramImg"), large = $("#diagramZoomImg");
    large.src = source.src; large.alt = source.alt;
    $("#diagramZoomTitle").textContent = source.alt;
    setScale(false);
    dialog.showModal();
  });
  $("#diagramZoomClose").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", e => { if (e.target === dialog) dialog.close(); });
  show(list[0].id);
}

/* ====================================================================
   08 規則清單：勾選保存在瀏覽器
==================================================================== */
function setupChecklist() {
  const boxes = $$("#rulesChecklist input[data-rule]");
  if (!boxes.length) return;
  const done = new Set(loadStore().rules || []);
  boxes.forEach(cb => {
    cb.checked = done.has(cb.dataset.rule);
    cb.addEventListener("change", () => { if (cb.checked) done.add(cb.dataset.rule); else done.delete(cb.dataset.rule); saveStore({ rules: [...done] }); });
  });
  const reset = $("#rulesReset");
  if (reset) reset.addEventListener("click", () => {
    boxes.forEach(cb => { cb.checked = false; });
    done.clear();
    saveStore({ rules: [] });
    showToast("已清空勾選，換作業記得重新確認。");
  });
}

/* ====================================================================
   09 提示詞庫
==================================================================== */
const PROMPT_CARDS = [
  {
    "title": "讀懂文章與查證",
    "when": "NotebookLM",
    "text": "請只根據我提供的文章，用白話中文說明主要問題、作者的主張與限制，附上引用。\n我不懂的段落是［貼上段落或填入問題］，請再解釋這一段；若用自編例子說明，請明確標示。分清原文內容和你的推論。"
  },
  {
    "title": "比較多篇文獻",
    "when": "NotebookLM",
    "text": "請只根據我提供的來源，比較它們對「［研究問題］」的主張、證據與限制，附上可回查的引用。\n指出主要共識與分歧；資料沒有提到的部分請寫「未提供」，不要補猜。"
  },
  {
    "title": "找出相關原文",
    "when": "NotebookLM",
    "text": "請找出來源中與「［概念或問題］」相關的段落，逐項附上引用，並簡短說明關聯。\n保留各篇來源的差異，不要合併成一個結論。找不到就說明；我會再用原文關鍵字搜尋補查。"
  },
  {
    "title": "整理課堂錄音",
    "when": "NotebookLM",
    "text": "這份錄音已確認可錄製及上傳。請只根據錄音整理主要主題，以及老師明確提到的作業要求，各附引用方便回聽。\n聽不清楚的姓名、術語、數字或日期請標示不確定，不要補猜。"
  },
  {
    "title": "製作語音導覽",
    "when": "NotebookLM",
    "text": "受眾：第一次接觸這個主題的研究所學生。\n重點：聚焦［想理解的問題］，比較來源中的主要觀點與限制。\n程度：保留重要英文名詞，第一次出現時用白話解釋。\n長度：簡短，避免重複背景；不要加入來源沒有的事實。"
  },
  {
    "title": "製作資訊圖表或簡報",
    "when": "NotebookLM",
    "text": "請根據選取的來源製作［一頁資訊圖表／簡報］，給［受眾］閱讀。\n重點是［希望讀者理解的問題］，呈現主要發現與限制，只用來源中的數字。\n每頁或每區只表達一個重點，保留重要條件與來源資訊。"
  },
  {
    "title": "檢查草稿的論點與證據",
    "when": "其他實用範例",
    "text": "請檢查我的草稿，先重述主要論點，再指出最多三個最值得修改的地方，例如證據不足、推論跳躍或概念不清。\n引用草稿中的具體句子，說明原因與修改方向，先不要替我重寫，也不要編造支持證據。\n\n作業要求：［貼上］\n草稿：［貼上］"
  },
  {
    "title": "練習 seminar 討論",
    "when": "其他實用範例",
    "text": "我要討論［議題］，我的看法是［填入］。請扮演會認真追問的同學，一次只問一個問題，等我回答再繼續。\n先討論內容，有需要再給簡短的英文表達建議；如果證據不足，請指出，不要替我編造。"
  },
  {
    "title": "整理作業要求與截止日",
    "when": "其他實用範例",
    "text": "請根據我提供的課程文件，把各項作業整理成表格：課程、作業名稱、要交的內容、截止日期與時間、來源檔名和頁碼。\n未寫明的資訊標示「未提供」；不同文件有衝突時並列，先不要自行選定。我會回原文件核對。\n若需要另存檔案，請另存新檔，不修改原始材料。"
  }
];
const CARD_GROUPS = [
  { when: "NotebookLM", name: "NotebookLM", tool: "閱讀與整理來源" },
  { when: "其他實用範例", name: "其他實用範例", tool: "對話型 AI；處理本機檔案可用 Agent" }
];

function renderCards() {
  const lib = $("#cardLib");
  lib.replaceChildren();
  CARD_GROUPS.forEach(group => {
    const section = document.createElement("div");
    section.className = "prompt-example-group";
    const heading = document.createElement("h3");
    heading.textContent = group.name;
    const note = document.createElement("p");
    note.className = "prompt-group-note";
    note.textContent = group.tool;
    section.append(heading, note);
    lib.append(section);
    PROMPT_CARDS.forEach((card, i) => {
    if (card.when !== group.when) return;
    const details = document.createElement("details");
    details.className = "prompt-example";
    const summary = document.createElement("summary");
    summary.textContent = card.title;
    const label = document.createElement("label");
    label.htmlFor = `saved-prompt-${i}`;
    label.className = "sr-only";
    label.textContent = `${card.title}：可編輯的提示詞`;
    const editor = document.createElement("textarea");
    editor.id = label.htmlFor;
    editor.value = card.text;
    editor.rows = 5;
    const copy = document.createElement("button");
    copy.type = "button";
    copy.className = "copy-btn";
    copy.textContent = "複製";
    copy.addEventListener("click", () => {
      if (!editor.value.trim()) { showToast("請先輸入內容。"); return; }
      copyText(editor.value, copy);
    });
    const reset = document.createElement("button");
    reset.type = "button";
    reset.className = "btn ghost";
    reset.textContent = "還原範例";
    reset.addEventListener("click", () => { editor.value = card.text; autoGrow(editor); showToast("已還原成範例。"); });
    const actions = document.createElement("div");
    actions.className = "card-actions";
    actions.append(copy, reset);
    editor.addEventListener("input", () => autoGrow(editor));
    details.addEventListener("toggle", () => { if (details.open) autoGrow(editor); });
    details.append(summary, label, editor, actions);
    section.append(details);
    });
  });
  window.addEventListener("resize", () => $$(".prompt-example[open] textarea").forEach(autoGrow));
}

/* ====================================================================
   手機介面：目錄選單、目前章節、表格變卡片、短片點一下播放
==================================================================== */
function setupManifest() {
  if (!/^https?:$/.test(location.protocol)) return;
  const link = document.createElement("link"); link.rel = "manifest"; link.href = "./manifest.webmanifest"; document.head.appendChild(link);
}

function setupMobileMenu() {
  const btn = $("#menuBtn"), nav = $("#topnav"), main = $("main"), now = $("#navNow");
  if (!btn || !nav) return;
  if (now && !now.textContent) now.textContent = "研究所 AI 手冊";
  const compact = window.matchMedia("(max-width: 1000px)");
  const setBarHeight = () => document.documentElement.style.setProperty("--bar-h", $(".topbar").offsetHeight + "px");
  const open = (on, returnFocus = false) => {
    document.body.classList.toggle("menu-open", on);
    btn.setAttribute("aria-expanded", String(on));
    btn.textContent = on ? "關閉" : "目錄";
    main.inert = on;
    if (on) (nav.querySelector(".active") || nav.querySelector("a")).focus();
    else if (returnFocus) btn.focus();
  };
  setBarHeight();
  window.addEventListener("resize", () => {
    if (!compact.matches) open(false);
    setBarHeight();
  });
  btn.addEventListener("click", () => open(!document.body.classList.contains("menu-open")));
  nav.addEventListener("click", e => {
    const link = e.target.closest("a");
    if (!link || !compact.matches) return;
    open(false);
    const target = $(link.getAttribute("href"));
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  });
  document.addEventListener("keydown", e => {
    if (!document.body.classList.contains("menu-open")) return;
    if (e.key === "Escape") { e.preventDefault(); open(false, true); }
    if (e.key !== "Tab") return;
    const last = nav.querySelector("a:last-child");
    if (e.shiftKey && document.activeElement === btn) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); btn.focus(); }
  });
}

function labelTables() {
  $$("table.reading-table").forEach(t => {
    const heads = $$("thead th", t).map(th => th.textContent.trim());
    $$("tbody tr", t).forEach(tr => [...tr.children].forEach((td, i) => { if (heads[i]) td.dataset.label = heads[i]; }));
  });
}

function setupClips() {
  const videos = $$(".clip video");
  $$(".keyword-example, .learning-lesson").forEach(details => {
    const video = details.querySelector("video");
    if (!video) return;
    details.addEventListener("toggle", () => {
      if (!details.open) video.pause();
    });
  });
  videos.forEach(video => video.addEventListener("play", () => {
    videos.forEach(other => { if (other !== video) other.pause(); });
  }));
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) videos.forEach(video => video.pause());
  });
}

/* ====================================================================
   導覽列高亮 + 舊網址相容
==================================================================== */
function setupNav() {
  const links = $$("#topnav a"), now = $("#navNow");
  const sections = links.map(a => $(a.getAttribute("href")));
  let pending = false;
  const update = () => {
    pending = false;
    const threshold = window.innerWidth <= 1000 ? 120 : 100;
    let current = -1;
    sections.forEach((section, i) => { if (section.getBoundingClientRect().top <= threshold) current = i; });
    if (window.scrollY > 0 && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8) current = sections.length - 1;
    links.forEach((link, i) => {
      link.classList.toggle("active", i === current);
      if (i === current) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
    if (now) now.textContent = current < 0 ? "研究所 AI 手冊" : links[current].dataset.num + " " + links[current].textContent;
  };
  const schedule = () => { if (!pending) { pending = true; requestAnimationFrame(update); } };
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  window.addEventListener("hashchange", schedule);
  new ResizeObserver(schedule).observe($("main"));
  update();
}

function migrateOldRoutes() {
  const h = location.hash;
  if (!h || document.getElementById(h.slice(1))) return;
  const unitMap = { intro: "concepts", rules: "rules", gemini: "prompt", diagrams: "diagrams", notebooklm: "reading", agent: "agent", onward: "situations" };
  const [head, id] = h.slice(1).split("/");
  let target = "hero";
  if (head === "course" || head === "lesson") target = unitMap[id] || "concepts";
  else if (head === "situation" || head === "situations") target = "situations";
  else if (head === "glossary") target = "concepts";
  else if (head === "prompts") target = "cards";
  location.replace("#" + target);
}

/* ---------- 啟動 ---------- */
setupCopyTargets();
renderBuilder();
renderAgent();
setupToolSwitch();
renderDiagrams();
setupChecklist();
renderCards();
setupNav();
setupManifest();
setupMobileMenu();
labelTables();
setupClips();
migrateOldRoutes();
window.addEventListener("hashchange", migrateOldRoutes);
$("#readingCopy").addEventListener("click", e => copyText($("#readingSource").innerText || $("#readingSource").textContent, e.currentTarget));
