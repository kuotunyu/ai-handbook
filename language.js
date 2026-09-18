/* Static editions also work without JavaScript. This enhances switching with
   chapter continuity and separate, temporary drafts for each language. */
(() => {
  const language = document.documentElement.lang;
  const prefix = 'ai-handbook-language-';
  const links = [...document.querySelectorAll('[data-language]')];
  const details = [...document.querySelectorAll('main details')];
  const validChapter = hash => document.getElementById(hash.slice(1))?.matches('main > section[id]');
  // Retain explicit reading/editing intent when focusing the sticky header
  // scrolls the viewport. Actual reader scrolling resumes geometric tracking.
  let intendedChapter = validChapter(location.hash) ? location.hash : null;
  document.addEventListener('focusin', event => {
    const section = event.target.closest('main > section[id]');
    if (section) intendedChapter = '#' + section.id;
  });
  document.querySelector('#topnav').addEventListener('click', event => {
    const link = event.target.closest('a');
    if (link && validChapter(link.hash)) intendedChapter = link.hash;
  });
  const resumeScrollTracking = () => { intendedChapter = null; };
  window.addEventListener('wheel', resumeScrollTracking, { passive: true });
  window.addEventListener('touchmove', resumeScrollTracking, { passive: true });
  document.addEventListener('keydown', event => {
    if (!event.target.matches('textarea, input') && ['PageDown', 'PageUp', 'Home', 'End', 'ArrowDown', 'ArrowUp', ' '].includes(event.key)) resumeScrollTracking();
  });
  const read = key => { try { return JSON.parse(sessionStorage.getItem(prefix + key)); } catch { return null; } };
  const write = (key, value) => { try { sessionStorage.setItem(prefix + key, JSON.stringify(value)); } catch { /* switching still works */ } };
  const pending = read('pending');
  if (pending === language) {
    write('pending', null);
    const state = read(language);
    if (state) {
      window.handbookBuilder?.restore(state.builder);
      details.forEach((el, i) => { el.open = Boolean(state.open?.[i]); });
      Object.entries(state.editors || {}).forEach(([id, value]) => {
        const editor = document.getElementById(id);
        if (editor instanceof HTMLTextAreaElement) {
          editor.value = value;
          editor.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
      const diagram = document.querySelector(`[data-diagram="${state.diagram}"]`);
      diagram?.click();
    }
    requestAnimationFrame(() => {
      const target = document.getElementById(location.hash.slice(1));
      if (!target) return;
      // Restored open sections above the chapter (PDF pages, charts, pictures) finish loading after
      // this and push the chapter down. Keep it at the top until the reader scrolls, for a few seconds.
      let readerMoved = false;
      const stop = () => { readerMoved = true; };
      ['wheel', 'touchstart', 'keydown'].forEach(type => window.addEventListener(type, stop, { once: true, passive: true }));
      const pin = () => { if (!readerMoved) target.scrollIntoView({ behavior: 'instant', block: 'start' }); };
      pin();
      const watcher = new ResizeObserver(pin);
      watcher.observe(document.querySelector('main'));
      setTimeout(() => watcher.disconnect(), 4000);
    });
  }
  const sectionHash = () => {
    // Same reading line as the chapter indicator in app.js: a chapter counts once its heading
    // passes the upper third of the screen, not only after it slides under the sticky bar.
    const threshold = document.querySelector('.topbar').getBoundingClientRect().height + Math.min(innerHeight * 0.3, 260);
    const onScreen = el => { const rect = el.getBoundingClientRect(); return rect.top < innerHeight - 40 && rect.bottom > threshold; };
    // A chapter the reader focused or picked from the menu wins only while it is still on screen:
    // dragging the scrollbar away from it fires no wheel or touch event to clear it.
    const intended = intendedChapter && document.getElementById(intendedChapter.slice(1));
    if (intended && onScreen(intended)) return intendedChapter;
    // Focusing a sticky-header control can scroll the page. If the explicitly
    // selected chapter is still on screen, keep that chapter during the switch.
    const anchored = document.getElementById(location.hash.slice(1));
    if (anchored?.matches('main > section[id]') && onScreen(anchored)) return location.hash;
    const sections = [...document.querySelectorAll('main > section[id]')];
    return '#' + (sections.filter(section => section.getBoundingClientRect().top <= threshold).at(-1)?.id || 'hero');
  };
  function updateLinks() {
    links.forEach(link => { link.hash = sectionHash(); });
  }
  links.forEach(link => link.addEventListener('click', event => {
    if (link.dataset.language === language) { event.preventDefault(); return; }
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const destination = link.href;
    write(language, {
      builder: window.handbookBuilder?.snapshot(),
      open: details.map(el => el.open),
      editors: Object.fromEntries([...document.querySelectorAll('.prompt-example textarea')].map(el => [el.id, el.value])),
      diagram: document.querySelector('.diagram-tab.active')?.dataset.diagram
    });
    write('pending', link.dataset.language);
    location.assign(destination);
  }));
  let scheduled = false;
  window.addEventListener('scroll', () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; updateLinks(); });
  }, { passive: true });
  updateLinks();
})();

