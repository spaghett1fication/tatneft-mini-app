import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const ROOT = path.resolve('dist');
const MIME = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.svg':'image/svg+xml', '.json':'application/json' };
const server = http.createServer((req,res)=>{
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/' || p === '') p = '/index.html';
  const file = path.join(ROOT, p);
  fs.readFile(file, (err,data)=>{
    if(err){ res.writeHead(404); res.end('nf'); return; }
    res.writeHead(200, {'Content-Type': MIME[path.extname(file)]||'application/octet-stream'});
    res.end(data);
  });
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const port = server.address().port;
const URL = `http://127.0.0.1:${port}/tatneft-mini-app/`;
console.log('SERVER', URL);

const browser = await puppeteer.launch({
  executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless:'new', args:['--no-sandbox','--disable-setuid-sandbox']
});
const page = await browser.newPage();
const errors=[];
page.on('console', m=>{ if(m.type()==='error') errors.push(m.text()); });
page.on('pageerror', e=>errors.push('PAGEERR: '+e.message));
await page.goto(URL, { waitUntil:'networkidle0' });
await new Promise(r=>setTimeout(r,500));
const labels = await page.$$eval('label', els=>els.map(e=>e.textContent.trim()));
console.log('LABELS:', JSON.stringify(labels));
const inputs = await page.$$('input');
console.log('NUM INPUTS:', inputs.length);
let masterIdx=-1;
for(let i=0;i<inputs.length;i++){
  const ph = await page.evaluate(el=>el.placeholder, inputs[i]);
  if(ph && ph.includes('Иванов')) masterIdx=i;
}
console.log('MASTER IDX:', masterIdx, 'PH:', masterIdx>=0?await page.evaluate(el=>el.placeholder, inputs[masterIdx]):'');
await inputs[masterIdx].click();
await inputs[masterIdx].type('Иван Иванов Иванович', {delay:10});
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
console.log('=== ERRORS ===\n'+JSON.stringify(errors,null,2));
await browser.close();
server.close();
