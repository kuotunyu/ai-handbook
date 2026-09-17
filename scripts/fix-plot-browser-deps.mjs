import fs from 'node:fs';

const path = 'app.js';
let source = fs.readFileSync(path, 'utf8');
const before = `  function loadPlot() {\n    if (window.Plot) return Promise.resolve(window.Plot);\n    if (loading) return loading;\n    loading = new Promise((resolve, reject) => {\n      const script = document.createElement("script");\n      script.src = "./vendor/observable-plot.umd.min.js";\n      script.dataset.observablePlot = "0.6.17";\n      script.onload = () => window.Plot ? resolve(window.Plot) : reject(new Error("Plot global missing"));\n      script.onerror = () => reject(new Error("Observable Plot failed to load"));\n      document.head.append(script);\n    });\n    return loading;\n  }`;
const after = `  function loadScript(src, marker) {\n    return new Promise((resolve, reject) => {\n      const existing = document.querySelector('script[' + marker + ']');\n      if (existing) {\n        if (existing.dataset.loaded === "true") resolve();\n        else {\n          existing.addEventListener("load", () => resolve(), { once: true });\n          existing.addEventListener("error", () => reject(new Error(src + " failed to load")), { once: true });\n        }\n        return;\n      }\n      const script = document.createElement("script");\n      script.src = src;\n      script.setAttribute(marker, "true");\n      script.onload = () => { script.dataset.loaded = "true"; resolve(); };\n      script.onerror = () => reject(new Error(src + " failed to load"));\n      document.head.append(script);\n    });\n  }\n\n  function loadPlot() {\n    if (window.Plot && window.d3) return Promise.resolve(window.Plot);\n    if (loading) return loading;\n    loading = (async () => {\n      if (!window.d3) await loadScript("./vendor/d3.min.js", "data-d3-vendor");\n      if (!window.Plot) await loadScript("./vendor/observable-plot.umd.min.js", "data-observable-plot");\n      if (!window.Plot) throw new Error("Plot global missing");\n      return window.Plot;\n    })();\n    return loading;\n  }`;

if (source.includes(after)) {
  console.log('Plot browser dependencies already fixed.');
  process.exit(0);
}
if (!source.includes(before)) throw new Error('Plot loader block not found.');
source = source.replace(before, after);
fs.writeFileSync(path, source);
console.log('Updated Plot loader to load local D3 before Observable Plot.');
