import puppeteer from 'puppeteer-core';
// uso: node cmp.mjs <ruta> [width]
const [,, path, width='1440'] = process.argv;
const W=+width;
const b = await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:'new'});
const n = (path.replace(/\/$/,'').replace(/\//g,'_'))||'home';
const pg = await b.newPage(); await pg.setViewport({width:W,height:900,isMobile:W<800,hasTouch:W<800});
await pg.goto('http://localhost:4321/'+path, {waitUntil:'networkidle0', timeout:60000});
await pg.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=600){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,60));} window.scrollTo(0,0);});
await pg.addStyleTag({content:'.fade-in{animation:none!important} .wa-float{display:none!important}'});
await new Promise(r=>setTimeout(r,800));
await pg.screenshot({path:`../cmp/${n}_${W}_new.png`, fullPage:true});
if (W!==1440 || true) {
  const o = await b.newPage(); await o.setViewport({width:W,height:900, isMobile: W<800, hasTouch: W<800});
  await o.goto('https://inprotar.cl/'+path, {waitUntil:'networkidle2', timeout:90000});
  await o.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=600){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,100));} window.scrollTo(0,0);});
  await o.addStyleTag({content:'.elementor-invisible{visibility:visible!important;opacity:1!important;animation:none!important} .joinchat{display:none!important}'});
  await new Promise(r=>setTimeout(r,1500));
  await o.screenshot({path:`../cmp/${n}_${W}_old.png`, fullPage:true});
}
await b.close(); console.log(n);
