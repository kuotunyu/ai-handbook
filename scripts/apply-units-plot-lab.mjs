import fs from 'node:fs';

function replaceOnce(text, from, to, label) {
  if (text.includes(to)) return { text, changed: false };
  if (!text.includes(from)) throw new Error(`Could not find insertion point: ${label}`);
  return { text: text.replace(from, to), changed: true };
}

let html = fs.readFileSync('index.html', 'utf8');
let js = fs.readFileSync('app.js', 'utf8');
let tests = fs.readFileSync('tests/handbook.spec.js', 'utf8');
let changed = false;

const unitAnswerEnd = `                  <p><strong>實際使用：</strong>請 AI 先回報 rent_unit 的不同單位與轉換公式，保留原始欄位，新增月租欄位，完成後自己抽算一筆。</p>\n                </details>\n              </div>`;
const unitLabBlock = `                  <p><strong>實際使用：</strong>請 AI 先回報 rent_unit 的不同單位與轉換公式，保留原始欄位，新增月租欄位，完成後自己抽算一筆。</p>\n                </details>\n                <div class="plot-lab" id="unitsPlotLab">\n                  <div class="plot-lab-head"><strong>互動試試</strong><span>同兩筆資料，只改「有沒有先統一單位」。</span></div>\n                  <div class="plot-lab-controls" role="group" aria-label="租金比較方式">\n                    <button type="button" class="plot-mode" data-unit-mode="raw" aria-pressed="true">直接比 280 和 1,200（錯誤）</button>\n                    <button type="button" class="plot-mode" data-unit-mode="monthly" aria-pressed="false">先換成月租</button>\n                  </div>\n                  <div class="plot-lab-chart" id="unitsPlot" aria-live="polite"><p class="plot-loading">載入互動圖…</p></div>\n                  <p class="plot-lab-takeaway" id="unitsPlotTakeaway"><strong>不能直接比。</strong>280 是每週，1,200 是每月；數字看起來差很多，不代表 D2 比較便宜。</p>\n                </div>\n              </div>`;
let r = replaceOnce(html, unitAnswerEnd, unitLabBlock, 'unit-conversion Plot lab');
html = r.text; changed ||= r.changed;

const missingMarker = `/* ====================================================================\n   06 延伸：缺值互動圖。Observable Plot 僅在使用者展開本題時從本地 vendor 載入。\n==================================================================== */`;
const sharedAndUnits = `/* ====================================================================\n   06 延伸：Observable Plot 小實驗。只在使用者展開相應練習時載入本地 vendor。\n==================================================================== */\nlet observablePlotLoading = null;\n\nfunction loadVendorScript(src, marker) {\n  return new Promise((resolve, reject) => {\n    const existing = document.querySelector('script[' + marker + ']');\n    if (existing) {\n      if (existing.dataset.loaded === "true") resolve();\n      else {\n        existing.addEventListener("load", () => resolve(), { once: true });\n        existing.addEventListener("error", () => reject(new Error(src + " failed to load")), { once: true });\n      }\n      return;\n    }\n    const script = document.createElement("script");\n    script.src = src;\n    script.setAttribute(marker, "true");\n    script.onload = () => { script.dataset.loaded = "true"; resolve(); };\n    script.onerror = () => reject(new Error(src + " failed to load"));\n    document.head.append(script);\n  });\n}\n\nfunction loadObservablePlot() {\n  if (window.Plot && window.d3) return Promise.resolve(window.Plot);\n  if (observablePlotLoading) return observablePlotLoading;\n  observablePlotLoading = (async () => {\n    if (!window.d3) await loadVendorScript("./vendor/d3.min.js", "data-d3-vendor");\n    if (!window.Plot) await loadVendorScript("./vendor/observable-plot.umd.min.js", "data-observable-plot");\n    if (!window.Plot) throw new Error("Plot global missing");\n    return window.Plot;\n  })();\n  return observablePlotLoading;\n}\n\nfunction setupUnitConversionPlot() {\n  const lesson = $("#lesson-units");\n  const chart = $("#unitsPlot");\n  const takeaway = $("#unitsPlotTakeaway");\n  const buttons = Array.from(document.querySelectorAll("#unitsPlotLab [data-unit-mode]"));\n  if (!lesson || !chart || !takeaway || !buttons.length) return;\n\n  const data = [\n    { id: "D1", name: "D1 河岸區", raw: 1200, unit: "月", monthly: 1200 },\n    { id: "D2", name: "D2 舊城區", raw: 280, unit: "週", monthly: 1213.33 }\n  ];\n  let mode = "raw";\n  let plotApi = null;\n\n  function money(value) {\n    return value.toLocaleString("en-GB", { minimumFractionDigits: Number.isInteger(value) ? 0 : 2, maximumFractionDigits: 2 });\n  }\n\n  function render() {\n    if (!plotApi) return;\n    const styles = getComputedStyle(document.documentElement);\n    const brand = styles.getPropertyValue("--brand").trim() || "#2C7A8C";\n    const warning = styles.getPropertyValue("--terracotta").trim() || "#D0656E";\n    const rows = data.map(d => ({\n      ...d,\n      value: mode === "monthly" ? d.monthly : d.raw,\n      label: mode === "monthly" ? "£" + money(d.monthly) + "／月" : "£" + money(d.raw) + "／" + d.unit\n    }));\n\n    if (mode === "raw") {\n      takeaway.innerHTML = "<strong>不能直接比。</strong>280 是每週，1,200 是每月；長條差很多只是單位不同造成的假象。";\n    } else {\n      takeaway.innerHTML = "<strong>同一單位後再比。</strong>D2 約 £1,213.33／月，比 D1 的 £1,200／月高約 £13.33。";\n    }\n\n    const plot = plotApi.plot({\n      width: Math.max(320, Math.min(720, chart.clientWidth || 640)),\n      height: 230,\n      marginLeft: 108,\n      marginRight: 22,\n      x: { domain: [0, 1300], grid: true, label: mode === "raw" ? "原始數字（單位不同，不能直接比較）" : "月租（GBP）" },\n      y: { domain: data.map(d => d.name), label: null },\n      style: { fontFamily: "inherit", fontSize: "13px" },\n      marks: [\n        plotApi.ruleX([0]),\n        plotApi.barX(rows, { x: "value", y: "name", fill: d => mode === "raw" && d.id === "D2" ? warning : brand, title: d => d.name + ": " + d.label }),\n        plotApi.text(rows, { x: "value", y: "name", text: "label", textAnchor: "end", dx: -8, fill: "white", fontWeight: 700 })\n      ]\n    });\n    plot.setAttribute("role", "img");\n    plot.setAttribute("aria-label", mode === "raw" ? "錯誤示範。D1 的每月 1200 與 D2 的每週 280 被直接放在同一尺度，因此無法判斷哪個較便宜。" : "統一單位後的租金比較。D1 是每月 1200，D2 約每月 1213.33。" );\n    chart.replaceChildren(plot);\n  }\n\n  async function ensurePlot() {\n    if (plotApi) { render(); return; }\n    chart.innerHTML = '<p class="plot-loading">載入互動圖…</p>';\n    try {\n      plotApi = await loadObservablePlot();\n      render();\n    } catch (error) {\n      chart.innerHTML = '<p class="plot-loading"><strong>互動圖未載入。</strong>文字重點不受影響：不同時間單位不能直接比較，先換成同一基準。</p>';\n    }\n  }\n\n  lesson.addEventListener("toggle", () => { if (lesson.open) ensurePlot(); });\n  buttons.forEach(btn => btn.addEventListener("click", () => {\n    mode = btn.dataset.unitMode;\n    buttons.forEach(other => other.setAttribute("aria-pressed", String(other === btn)));\n    ensurePlot();\n  }));\n  if (lesson.open) ensurePlot();\n}\n\n${missingMarker}`;
r = replaceOnce(js, missingMarker, sharedAndUnits, 'shared Plot loader and unit lab JavaScript');
js = r.text; changed ||= r.changed;

const localLoaderPattern = /  let mode = "missing";\n  let plotApi = null;\n  let loading = null;\n\n  function loadScript\(src, marker\) \{[\s\S]*?\n  function render\(\) \{/;
if (js.includes('let loading = null;') && js.includes('function setupMissingValuePlot()')) {
  const next = js.replace(localLoaderPattern, '  let mode = "missing";\n  let plotApi = null;\n\n  function render() {');
  if (next === js) throw new Error('Could not extract the missing-value local Plot loader.');
  js = next;
  changed = true;
}
if (js.includes('plotApi = await loadPlot();')) {
  js = js.replace('plotApi = await loadPlot();', 'plotApi = await loadObservablePlot();');
  changed = true;
}

const initMarker = `setupToolSwitch();\nsetupMissingValuePlot();\nrenderDiagrams();`;
const initReplacement = `setupToolSwitch();\nsetupUnitConversionPlot();\nsetupMissingValuePlot();\nrenderDiagrams();`;
r = replaceOnce(js, initMarker, initReplacement, 'unit Plot init');
js = r.text; changed ||= r.changed;

const testMarker = `test('missing-value Plot lab lazy-loads and changes the interpretation', async ({ page }) => {`;
const unitTest = `test('unit Plot lab shows why weekly and monthly values must be normalized', async ({ page }) => {\n  const lesson = page.locator('#lesson-units');\n  await lesson.locator(':scope > summary').click();\n  await expect(page.locator('#unitsPlotLab')).toBeVisible();\n  await expect(page.locator('#unitsPlot svg')).toBeVisible({ timeout: 5000 });\n  await expect(page.locator('#unitsPlotTakeaway')).toContainText('不能直接比');\n  await page.locator('[data-unit-mode="monthly"]').click();\n  await expect(page.locator('#unitsPlotTakeaway')).toContainText('1,213.33');\n  await expect(page.locator('[data-unit-mode="monthly"]')).toHaveAttribute('aria-pressed', 'true');\n});\n\n${testMarker}`;
r = replaceOnce(tests, testMarker, unitTest, 'unit Plot test');
tests = r.text; changed ||= r.changed;

if (!changed) {
  console.log('No changes needed; unit Plot lab already applied.');
  process.exit(0);
}

fs.writeFileSync('index.html', html);
fs.writeFileSync('app.js', js);
fs.writeFileSync('tests/handbook.spec.js', tests);
console.log('Applied unit-conversion Observable Plot lab and shared loader.');
