const fs = require('fs');
const path = require('path');
const Tesseract = require('tesseract.js');

async function ocrAll() {
  const dir = 'pages';
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.png')).sort();
  let all = '';
  for (const f of files) {
    console.log('OCR', f);
    const { data: { text } } = await Tesseract.recognize(path.join(dir, f), 'eng', { logger: m => { if (m.status==='recognizing text') process.stdout.write('\r'+f+' '+Math.round((m.progress||0)*100)+'%   '); } });
    console.log('\n--- PAGE', f, '---');
    all += '\n\n===== ' + f + ' =====\n\n' + text;
    fs.writeFileSync(path.join('ocr', f.replace('.png','.txt')), text, 'utf8');
  }
  fs.mkdirSync('ocr', { recursive: true });
  // rewrite combined after ensuring dir
  fs.writeFileSync('ocr_all.txt', all, 'utf8');
  console.log('DONE chars', all.length);
}
fs.mkdirSync('ocr', { recursive: true });
ocrAll().catch(e => { console.error(e); process.exit(1); });
