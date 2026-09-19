/* Complete original text from scripts/generate-evidence-pdf.mjs.
   Keep both pages aligned with that source; the exercise uses the same English
   PDF in both editions. Only the reading controls are translated. */
(() => {
  'use strict';

  const pages = {
    1: [
      ['h4', 'Evening Library Hours Pilot'],
      ['p', 'Teaching brief - fictional source for evidence-checking practice'],
      ['p', 'Mei Lin and James Carter\nUrban Learning Methods Lab, 2026'],
      ['h5', 'Purpose'],
      ['p', 'A university library extended evening opening hours for four weeks.\nThe pilot asked whether students used the additional hours and how visitors described them.'],
      ['h5', 'Observed results'],
      ['p', 'Evening visits increased from 120 to 180 per week during the pilot.\nA voluntary survey of 40 visitors found that 30 said later closing helped them study.'],
      ['h5', 'Important scope note'],
      ['p', 'The survey covered visitors who chose to respond. It did not sample all students.'],
      ['p', 'Turn to page 2 for limitations and interpretation.']
    ],
    2: [
      ['h4', 'Results and limitations'],
      ['h5', 'Observed:'],
      ['ul', [
        'Evening visits increased during the four-week pilot.',
        '30 of 40 surveyed visitors said later closing helped them study.'
      ]],
      ['h5', 'Limitations:'],
      ['ul', [
        'The pilot took place during exam season.',
        'There was no comparison library or control group.',
        'Academic grades were not collected or analysed.',
        'The visitor survey was voluntary and does not represent all students.'
      ]],
      ['h5', 'Interpretation'],
      ['p', 'The pilot supports the claim that evening use increased during the trial.\nIt does not establish that longer opening hours caused the increase.\nIt does not establish that extended hours improved academic performance.'],
      ['h5', 'Recommended wording'],
      ['p', '"Evening visits increased during the four-week pilot; the study did not test grade effects."'],
      ['p', 'Page 2']
    ]
  };

  function setup() {
    const viewer = document.getElementById('evidencePdfViewer');
    const buttons = Array.from(document.querySelectorAll('#pdfEvidenceLab [data-evidence-page]'));
    if (!viewer || !buttons.length || document.getElementById('evidenceSourceText')) return;

    const english = document.documentElement.lang.startsWith('en');
    const details = document.createElement('details');
    details.id = 'evidenceSourceText';
    details.className = 'evidence-source-text';
    const summary = document.createElement('summary');
    summary.textContent = english ? 'Read the original text on this page' : '閱讀本頁原文文字';
    const content = document.createElement('div');
    content.id = 'evidenceSourcePage';
    content.className = 'evidence-source-page';
    content.lang = 'en';
    content.setAttribute('role', 'region');
    details.append(summary, content);
    viewer.before(details);

    function showPage(number) {
      if (!pages[number]) return;
      content.setAttribute('aria-label', english ? `Original PDF page ${number} text` : `原始 PDF 第 ${number} 頁文字`);
      const elements = pages[number].map(([tag, text]) => {
        const element = document.createElement(tag);
        if (tag === 'ul') {
          text.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            element.append(li);
          });
        } else {
          element.textContent = text;
        }
        return element;
      });
      content.replaceChildren(...elements);
    }

    const selected = buttons.find(button => button.getAttribute('aria-pressed') === 'true');
    showPage(Number(selected ? selected.dataset.evidencePage : 2));
    buttons.forEach(button => button.addEventListener('click', () => showPage(Number(button.dataset.evidencePage))));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup, { once: true });
  else setup();
})();
