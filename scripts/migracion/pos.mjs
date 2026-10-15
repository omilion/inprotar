import puppeteer from 'puppeteer-core';
const [,, path, width='1440'] = process.argv; const W=+width;
const b = await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:'new'});
async function grab(url, old){
  const pg = await b.newPage(); await pg.setViewport({width:W,height:900,isMobile:W<800});
  await pg.goto(url,{waitUntil: old?'networkidle2':'networkidle0', timeout:90000});
  await pg.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=600){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,50));} window.scrollTo(0,0);});
  await pg.addStyleTag({content:'.elementor-invisible{visibility:visible!important;opacity:1!important;animation:none!important}'});
  await new Promise(r=>setTimeout(r,800));
  const r = await pg.evaluate(()=>{const out=[]; const seen=new Set();
    for(const e of document.querySelectorAll('h1,h2,h3,h4,figcaption,a.el-btn,.elementor-button,.bdt-ep-button,img,footer, [data-elementor-type="footer"], summary, .eael-accordion-header')){
      const r=e.getBoundingClientRect(); if(r.width<2||r.height<2) continue;
      let t=(e.tagName==='IMG'? 'IMG:'+(e.currentSrc||e.src).split('/').pop().slice(0,30) : e.innerText.trim().replace(/\s+/g,' ').slice(0,38));
      if(e.tagName==='FOOTER'||e.dataset.elementorType==='footer') t='FOOTER';
      const k=t; if(seen.has(k)) continue; seen.add(k);
      out.push([k, Math.round(r.top+scrollY), Math.round(r.left), Math.round(r.width), Math.round(r.height)]);}
    return out;});
  await pg.close(); return r;
}
const o = await grab('https://inprotar.cl/'+path, true);
const n = await grab('http://localhost:4321/'+path, false);
const nm = new Map(n.map(x=>[x[0].toLowerCase(),x]));
for (const x of o){ const y=nm.get(x[0].toLowerCase()); const d = y? (y[1]-x[1]) : null;
  console.log((d===null?'  MISSING':(Math.abs(d)>6?'**':'  ')+String(d).padStart(5)), String(x[1]).padStart(5), x[0], y? `x:${x[2]}->${y[2]} w:${x[3]}->${y[3]} h:${x[4]}->${y[4]}`:'' ); }
await b.close();
