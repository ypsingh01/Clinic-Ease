const fs = require('fs');
const { PDFParse } = require('pdf-parse');

async function run() {
  const buffer = fs.readFileSync('c:\\Users\\yashs\\OneDrive\\Desktop\\ClinicEase\\Requirement Analysis & SDLC Documentation.pdf');
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  fs.writeFileSync('req_text.txt', result.text, 'utf8');
  console.log('chars:', result.text.length);
  console.log('pages approx from text splits:', (result.text.match(/\f/g) || []).length + 1);
}
run().catch(e => { console.error(e); process.exit(1); });
