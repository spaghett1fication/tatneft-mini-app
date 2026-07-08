import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';
const ROOT = path.resolve('dist');
const PREFIX = '/tatneft-mini-app';
const MIME = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.svg':'image/svg+xml', '.json':'application/json' };
const server = http.createServer((req,res)=>{
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.startsWith(PREFIX)) p = p.slice(PREFIX.length);
  if (p===''||p==='/') p='/index.html';
  const file = path.join(ROOT,p);
  fs.readFile(file,(err,data)=>{
    if(err){ res.writeHead(404); res.end('nf'); return; }
    res.writeHead(200,{'Content-Type':MIME[path.extname(file)]||'application/octet-stream'});
    res.end(data);
  });
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const port = server.address().port;
const URL = `http://127.0.0.1:${port}/tatneft-mini-app/`;
const browser = await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:'new',args:['--no-sandbox','--disable-setuid-sandbox']});
const page = await browser.newPage();
const errors=[];
page.on('console',m=>{ if(m.type()==='error') errors.push(m.text()); });
page.on('pageerror',e=>errors.push('PAGEERR: '+e.message));
await page.goto(URL,{waitUntil:'networkidle0'});
await new Promise(r=>setTimeout(r,500));

const inputs = await page.$$('input');
let masterIdx=-1;
for(let i=0;i<inputs.length;i++){
  const ph = await page.evaluate(el=>el.placeholder, inputs[i]);
  if(ph && ph.includes('Иванов')) masterIdx=i;
}
// Fill a minimal valid form: object + master
const objIdx = 1; // date=0, object=1, master=2 (in demo, master is 3rd input)
await inputs[1].click(); await inputs[1].type('КНС-171', {delay:5});
await inputs[masterIdx].click(); await inputs[masterIdx].type('Иван Иванов Иванович', {delay:5});
await new Promise(r=>setTimeout(r,300));

// Open preview
await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>x.textContent.trim().includes('Предпросмотр')); b&&b.click(); });
await new Promise(r=>setTimeout(r,400));
const preview = await page.evaluate(()=>{ const m=document.querySelector('.fixed'); return m?m.innerText:'(no modal)'; });
console.log('=== PREVIEW ===\n'+preview);
const masterShown = preview.includes('Иван Иванов Иванович');
console.log('MASTER NAME IN PREVIEW:', masterShown);

// Close preview
await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>x.textContent.trim()==='×'); b&&b.click(); });
await new Promise(r=>setTimeout(r,300));

// Click "Отправить в чат бота"
await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Отправить в чат бота')); b&&b.click(); });
await new Promise(r=>setTimeout(r,400));
const sendModal = await page.evaluate(()=>{ const m=document.querySelector('.fixed'); return m?m.innerText:'(no modal)'; });
console.log('=== SEND MODAL (demo) ===\n'+sendModal);
const sendHasName = sendModal.includes('Иван Иванов Иванович');
const sendHasObject = sendModal.includes('КНС-171');
console.log('SEND MODAL HAS NAME:', sendHasName, '| HAS OBJECT:', sendHasObject);

console.log('=== ERRORS ===', JSON.stringify(errors));
await browser.close(); server.close();
