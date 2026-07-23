const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

async function run() {
  const buffer = fs.readFileSync('c:\\Users\\yashs\\OneDrive\\Desktop\\ClinicEase\\Requirement Analysis & SDLC Documentation.pdf');
  const parser = new PDFParse({ data: buffer });
  const info = await parser.getInfo();
  console.log('info keys', Object.keys(info));
  console.log(JSON.stringify(info, null, 2).slice(0, 2000));
  const shot = await parser.getScreenshot({ scale: 2 });
  console.log('screenshot keys', Object.keys(shot));
  console.log('pages?', shot.pages ? shot.pages.length : 'no pages');
  const outDir = 'pages';
  fs.mkdirSync(outDir, { recursive: true });
  if (shot.pages) {
    for (let i = 0; i < shot.pages.length; i++) {
      const p = shot.pages[i];
      const data = p.data || p.buffer || p;
      const name = path.join(outDir, 'page-' + String(i+1).padStart(2,'0') + '.png');
      if (Buffer.isBuffer(data) || data instanceof Uint8Array) {
        fs.writeFileSync(name, data);
      } else if (typeof data === 'string' && data.startsWith('data:')) {
        const b64 = data.split(',')[1];
        fs.writeFileSync(name, Buffer.from(b64, 'base64'));
      } else if (p.dataUrl) {
        const b64 = p.dataUrl.split(',')[1];
        fs.writeFileSync(name, Buffer.from(b64, 'base64'));
      } else {
        console.log('page', i+1, 'keys', Object.keys(p));
      }
    }
  } else {
    console.log(JSON.stringify(shot, (k,v)=> typeof v==='string' && v.length>200 ? v.slice(0,100)+'...' : v, 2).slice(0,3000));
  }
}
run().catch(e => { console.error(e); process.exit(1); });
