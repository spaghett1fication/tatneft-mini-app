import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';
const ROOT = path.resolve('dist');
const MIME = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.svg':'image/svg+xml', '.json':'application/json' };
const server = http.createServer((req,res)=>{
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p==='/'||p==='') p='/index.html';
  const file = path.join(ROOT,p);
  fs.readFile(file,(err,data)=>{
    if(err){ console.log('404:',p); res.writeHead(404); res.end('nf'); return; }
    res.writeHead(200,{'Content-Type':MIME[path.extname(file)]||'application/octet-stream'});
    res.end(data);
  });
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const port = server.address().port;
const URL = `http://127.0.0.1:${port}/tatneft-mini-app/`;
console.log('requested index.html script tag:');
const idx = fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
console.log(idx);
const browser = await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:'new',args:['--no-sandbox','--disable-setuid-sandbox']});
const page = await browser.newPage();
const errors=[];
page.on('console',m=>console.log('CONSOLE['+m.type()+']:',m.text()));
page.on('pageerror',e=>console.log('PAGEERR:',e.message));
page.on('requestfailed',r=>console.log('REQFAIL:',r.url(),r.failure()?.errorText));
await page.goto(URL,{waitUntil:'networkidle0'});
await new Promise(r=>setTimeout(r,800));
const rootHtml = await page.evaluate(()=>document.getElementById('root')?.innerHTML?.slice(0,300) || '(empty)');
console.log('ROOT HTML (first 300):', rootHtml);
const inputs = await page.$$('input');
console.log('NUM INPUTS:', inputs.length);
await browser.close(); server.close();
