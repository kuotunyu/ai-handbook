/* Per-language, same-tab drafts. Loaded after app.js and language.js. */
(() => {
  const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  function decode(raw, language, shape) {
    try {
      const state = JSON.parse(raw);
      if (!record(state) || state.version !== 1 || state.language !== language || !record(state.cards)) return null;
      const builder = state.builder;
      if (!record(builder) || !Number.isInteger(builder.cur) || builder.cur < 0 || builder.cur >= shape.drafts.length) return null;
      for (const [field, type] of [['drafts', 'string'], ['selected', 'boolean']]) {
        if (!Array.isArray(builder[field]) || builder[field].length !== shape.drafts.length) return null;
        if (!builder[field].every((row, i) => Array.isArray(row) && row.length === shape.drafts[i].length && row.every(value => typeof value === type))) return null;
      }
      if (!Object.entries(state.cards).every(([id, value]) => /^[a-z][a-z0-9-]*$/.test(id) && typeof value === 'string')) return null;
      return state;
    } catch { return null; }
  }
  if (typeof module !== 'undefined' && module.exports) { module.exports = { decode }; return; }

  const builder = window.handbookBuilder;
  if (!builder) return;
  const language = document.documentElement.lang;
  const english = language === 'en';
  const key = 'ai-handbook-drafts-v1:' + language;
  const cards = [...document.querySelectorAll('.prompt-example[data-prompt-id]')];
  const text = english ? {
    undo: 'Undo reset', undone: 'Your edits are restored.', reset: 'Example restored. You can undo this reset.',
    unavailable: 'Drafts cannot be saved in this tab. Copy important text before leaving.',
    builder: 'prompt builder', restore: 'Restore example'
  } : {
    undo: '復原剛才修改', undone: '已復原剛才的修改。', reset: '已還原範例，可復原剛才修改。',
    unavailable: '本分頁暫時無法保存草稿，離開前請先複製重要內容。',
    builder: '提示詞組裝器', restore: '還原範例'
  };
  const clone = value => JSON.parse(JSON.stringify(value));
  const builderPanel = document.querySelector('.builder');
  const resetButton = document.getElementById('builderReset');
  const undoByPanel = new Map();
  let timer;
  let storageWarningShown = false;
  let restoring = false;

  function status(panel, message) {
    let node = panel.querySelector('.draft-status');
    if (!node) {
      node = document.createElement('p');
      node.className = 'draft-status';
      node.setAttribute('role', 'status');
      node.setAttribute('aria-live', 'polite');
      (panel.querySelector('.builder-output') || panel).append(node);
    }
    node.textContent = message;
  }
  function save(panel = builderPanel) {
    clearTimeout(timer);
    if (restoring) return;
    try {
      sessionStorage.setItem(key, JSON.stringify({
        version: 1, language, builder: builder.snapshot(),
        cards: Object.fromEntries(cards.map(card => [card.dataset.promptId, card.querySelector('textarea').value]))
      }));
    } catch {
      if (!storageWarningShown) {
        storageWarningShown = true;
        status(panel, text.unavailable);
      }
    }
  }
  function undoButton(panel, reset, name) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'copy-btn';
    button.dataset.draftUndo = '';
    button.textContent = text.undo;
    button.setAttribute('aria-label', `${text.undo}: ${name}`);
    button.hidden = true;
    reset.setAttribute('aria-label', `${text.restore}: ${name}`);
    reset.after(button);
    undoByPanel.set(panel, { button, reset, value: null });
    status(panel, ''); // The live region exists before a reset/undo announcement.
    return button;
  }
  undoButton(builderPanel, resetButton, text.builder).id = 'builderUndo';
  cards.forEach(card => {
    const reset = card.querySelector('[data-prompt-reset]');
    if (reset) undoButton(card, reset, card.querySelector('summary').textContent);
  });

  // Corrupt/older storage never reaches restore(), so examples remain intact.
  let saved;
  try { saved = decode(sessionStorage.getItem(key), language, builder.snapshot()); } catch { /* storage can be unavailable */ }
  if (saved) {
    builder.restore(saved.builder);
    cards.forEach(card => {
      if (!Object.hasOwn(saved.cards, card.dataset.promptId)) return;
      const editor = card.querySelector('textarea');
      editor.value = saved.cards[card.dataset.promptId];
      editor.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }

  // Capture the pre-reset value before app.js runs its normal reset handler.
  // Capture navigation too: language.js navigates before a bubbling listener runs.
  document.addEventListener('click', event => {
    if (event.target.closest('[data-language]')) save();
    const reset = event.target.closest('#builderReset, [data-prompt-reset]');
    if (!reset) return;
    const panel = reset.closest('.prompt-example, .builder');
    const undo = undoByPanel.get(panel);
    if (!undo) return;
    undo.value = panel === builderPanel ? clone(builder.snapshot()) : panel.querySelector('textarea').value;
    undo.button.hidden = false;
  }, true);

  document.addEventListener('input', event => {
    const panel = event.target.closest('.prompt-example[data-prompt-id], .builder');
    if (!panel || !event.target.matches('textarea')) return;
    clearTimeout(timer);
    timer = setTimeout(() => save(panel), 150);
  });

  document.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    const panel = button.closest('.prompt-example, .builder');
    const undo = undoByPanel.get(panel);
    if (button.matches('[data-draft-undo]') && undo?.value !== null) {
      restoring = true;
      if (panel === builderPanel) {
        // Undo only the reset formula; edits to the other formula stay untouched.
        const previous = undo.value;
        const current = clone(builder.snapshot());
        current.cur = previous.cur;
        current.drafts[previous.cur] = previous.drafts[previous.cur];
        current.selected[previous.cur] = previous.selected[previous.cur];
        builder.restore(current);
      } else {
        const editor = panel.querySelector('textarea');
        editor.value = undo.value;
        editor.dispatchEvent(new Event('input', { bubbles: true }));
      }
      restoring = false;
      undo.value = null;
      undo.reset.focus();
      undo.button.hidden = true;
      status(panel, text.undone);
      save(panel);
    } else if (button.matches('#builderReset, [data-prompt-reset]')) {
      status(panel, text.reset);
      save(panel);
    } else if (button.matches('.formula-tab, .block-btn')) {
      if (!restoring && button.matches('.formula-tab')) {
        const builderUndo = undoByPanel.get(builderPanel);
        builderUndo.value = null;
        builderUndo.button.hidden = true;
      }
      save(builderPanel);
    }
  });
  window.addEventListener('pagehide', () => save());
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
})();
