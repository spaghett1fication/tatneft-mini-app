import puppeteer from 'puppeteer-core';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const URL = process.env.URL;
const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'new',
  args: ['--no-sandbox','--disable-setuid-sandbox','--allow-file-access-from-files']
});
const page = await browser.newPage();
const errors=[];
page.on('console', m=>{ if(m.type()==='error') errors.push(m.text()); });
page.on('pageerror', e=>errors.push('PAGEERROR: '+e.message));
await page.goto(URL, { waitUntil:'networkidle0' });
await new Promise(r=>setTimeout(r,600));
const labels = await page.$$eval('label', els=>els.map(e=>e.textContent.trim()));
console.log('LABELS:', JSON.stringify(labels));
const inputs = await page.$$('input');
console.log('NUM INPUTS:', inputs.length);
let masterIdx=-1;
for(let i=0;i<inputs.length;i++){
  const ph = await page.evaluate(el=>el.placeholder, inputs[i]);
  if(ph && ph.includes('Иванов')) masterIdx=i;
}
console.log('MASTER IDX:', masterIdx);
await inputs[masterIdx].click();
await inputs[masterIdx].type('Иван Иванов Иванович', {delay:15});
await new Promise(r=>setTimeout(r,300));
const masterVal = await page.evaluate(el=>el.value, inputs[masterIdx]);
console.log('MASTER VALUE:', JSON.stringify(masterVal));
const clicked = await page.evaluate(()=>{
  const b=[...document.querySelectorAll('button')].find(x=>x.textContent.trim().includes('Предпросмотр'));
  if(b){b.click();return true;} return false;
});
console.log('CLICKED PREVIEW:', clicked);
await new Promise(r=>setTimeout(r,400));
const previewText = await page.evaluate(()=>{
  const m=document.querySelector('.fixed'); return m?m.innerText:'(no modal)';
});
console.log('=== PREVIEW TEXT ===\n'+previewText);
console.log('=== CONSOLE ERRORS ===\n'+JSON.stringify(errors,null,2));
await browser.close();
