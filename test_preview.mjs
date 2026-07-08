import puppeteer from 'puppeteer-core';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const URL = process.env.URL || 'http://localhost:4173/tatneft-mini-app/';

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
const page = await browser.newPage();
const errors = [];
page.on('console', m => { if (m.type()==='error') errors.push(m.text()); });
page.on('pageerror', e => errors.push('PAGEERROR: '+e.message));

await page.goto(URL, { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 500));

// Find master input by label
const labels = await page.$$eval('label', els => els.map(e => e.textContent.trim()));
console.log('LABELS:', JSON.stringify(labels));

// Type into the master input (3rd input: date, object, master)
const inputs = await page.$$('input');
console.log('NUM INPUTS:', inputs.length);

// Find the master input: it's the one with placeholder "Иванов И.И."
let masterIdx = -1;
for (let i=0;i<inputs.length;i++){
  const ph = await page.evaluate(el => el.placeholder, inputs[i]);
  if (ph && ph.includes('Иванов')) masterIdx = i;
}
console.log('MASTER INPUT IDX:', masterIdx);

await inputs[masterIdx].click();
await inputs[masterIdx].type('Иван Иванов Иванович', { delay: 20 });
await new Promise(r => setTimeout(r, 300));

const masterVal = await page.evaluate(el => el.value, inputs[masterIdx]);
console.log('MASTER INPUT VALUE:', JSON.stringify(masterVal));

// Click "Предпросмотр" button
const clicked = await page.evaluate(() => {
  const btns = [...document.querySelectorAll('button')];
  const b = btns.find(x => x.textContent.trim().includes('Предпросмотр'));
  if (b) { b.click(); return true; }
  return false;
});
console.log('CLICKED PREVIEW:', clicked);
await new Promise(r => setTimeout(r, 400));

const previewText = await page.evaluate(() => {
  const modal = document.querySelector('.fixed');
  return modal ? modal.innerText : '(no modal)';
});
console.log('PREVIEW TEXT:\n' + previewText);

console.log('CONSOLE ERRORS:', JSON.stringify(errors));

await browser.close();
