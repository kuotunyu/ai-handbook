import fs from 'node:fs';
import path from 'node:path';

const out = path.join(process.cwd(), 'materials', 'evidence-library-pilot.pdf');
function pdfEscape(text) {
  return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}
function textStream(lines) {
  return [
    'BT', '/F1 11 Tf', '14 TL', '72 720 Td',
    ...lines.flatMap((line, index) => {
      if (line === '') return ['T*'];
      if (line.startsWith('## ')) {
        const text = pdfEscape(line.slice(3));
        return index === 0 ? ['/F1 20 Tf', '(' + text + ') Tj', 'T*', '/F1 11 Tf'] : ['T*', '/F1 15 Tf', '(' + text + ') Tj', 'T*', '/F1 11 Tf'];
      }
      return ['(' + pdfEscape(line) + ') Tj', 'T*'];
    }), 'ET'
  ].join('\n');
}

const page1 = textStream([
  '## Evening Library Hours Pilot',
  'Teaching brief - fictional source for evidence-checking practice',
  '', 'Mei Lin and James Carter', 'Urban Learning Methods Lab, 2026', '',
  'Purpose',
  'A university library extended evening opening hours for four weeks.',
  'The pilot asked whether students used the additional hours and how visitors described them.', '',
  'Observed results',
  'Evening visits increased from 120 to 180 per week during the pilot.',
  'A voluntary survey of 40 visitors found that 30 said later closing helped them study.', '',
  'Important scope note',
  'The survey covered visitors who chose to respond. It did not sample all students.', '',
  'Turn to page 2 for limitations and interpretation.'
]);
const page2 = textStream([
  '## Results and limitations',
  'Observed:',
  '- Evening visits increased during the four-week pilot.',
  '- 30 of 40 surveyed visitors said later closing helped them study.', '',
  'Limitations:',
  '- The pilot took place during exam season.',
  '- There was no comparison library or control group.',
  '- Academic grades were not collected or analysed.',
  '- The visitor survey was voluntary and does not represent all students.', '',
  'Interpretation',
  'The pilot supports the claim that evening use increased during the trial.',
  'It does not establish that longer opening hours caused the increase.',
  'It does not establish that extended hours improved academic performance.', '',
  'Recommended wording',
  '"Evening visits increased during the four-week pilot; the study did not test grade effects."', '',
  'Page 2'
]);

const objects = [];
const add = body => (objects.push(body), objects.length);
const catalog = add('<< /Type /Catalog /Pages 2 0 R >>');
add('<< /Type /Pages /Kids [3 0 R 4 0 R] /Count 2 >>');
add('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 6 0 R >>');
add('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 7 0 R >>');
add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
add('<< /Length ' + Buffer.byteLength(page1, 'binary') + ' >>\nstream\n' + page1 + '\nendstream');
add('<< /Length ' + Buffer.byteLength(page2, 'binary') + ' >>\nstream\n' + page2 + '\nendstream');

let pdf = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
const offsets = [0];
objects.forEach((body, i) => {
  offsets.push(Buffer.byteLength(pdf, 'binary'));
  pdf += (i + 1) + ' 0 obj\n' + body + '\nendobj\n';
});
const xrefOffset = Buffer.byteLength(pdf, 'binary');
pdf += 'xref\n0 ' + (objects.length + 1) + '\n0000000000 65535 f \n';
for (let i = 1; i <= objects.length; i++) pdf += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
pdf += 'trailer\n<< /Size ' + (objects.length + 1) + ' /Root ' + catalog + ' 0 R >>\nstartxref\n' + xrefOffset + '\n%%EOF\n';
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, Buffer.from(pdf, 'binary'));
console.log('Generated ' + out);
