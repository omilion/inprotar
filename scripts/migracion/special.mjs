import puppeteer from 'puppeteer-core';
import fs from 'fs';
// uso: node special.mjs '{"ruta/":["id1","id2"]}' out.json [width]
const jobs = JSON.parse(process.argv[2]); const out = process.argv[3]; const W = +(process.argv[4]||1440);
const b = await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:'new'});
const res = {};
for (const [path, ids] of Object.entries(jobs)) {
  const pg = await b.newPage(); await pg.setViewport({width:W,height:900,isMobile:W<800});
  await pg.goto('https://inprotar.cl/'+path, {waitUntil:'networkidle2', timeout:120000});
  await new Promise(r=>setTimeout(r,2000));
  await pg.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=300){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,200));} window.scrollTo(0,0);});
  await pg.addStyleTag({content:'.elementor-popup-modal,.dialog-widget{display:none!important} .elementor-invisible{visibility:visible!important;opacity:1!important}'});
  await new Promise(r=>setTimeout(r,1500));
  res[path] = await pg.evaluate((ids)=>{
    const K=['display','position','top','left','right','bottom','width','height','fontFamily','fontSize','fontWeight','fontStyle','color','lineHeight','letterSpacing','textTransform','textAlign','backgroundColor','backgroundImage','backgroundSize','backgroundPosition','paddingTop','paddingRight','paddingBottom','paddingLeft','marginTop','marginRight','marginBottom','marginLeft','borderTopWidth','borderTopStyle','borderTopColor','borderBottomWidth','borderBottomColor','borderRadius','boxShadow','opacity','gap','flexDirection','justifyContent','alignItems','gridTemplateColumns','objectFit','transform','zIndex','overflow','textShadow'];
    const skip=new Set(['none','normal','auto','0px','rgba(0, 0, 0, 0)','static','1','visible','start','0px none rgb(0, 0, 0)']);
    const o={};
    for (const id of ids){
      const root=document.querySelector(`[data-id="${id}"]`); if(!root){o[id]=null;continue;}
      const walk=(e,d)=>{ if(d>14) return null; const tn=e.tagName.toLowerCase(); if(['script','style','noscript'].includes(tn)) return null;
        const r=e.getBoundingClientRect(); const cs=getComputedStyle(e); const st={}; for(const k of K){const v=cs[k]; if(v&&!skip.has(v)) st[k]=v;}
        const n={tag:tn, cls:(typeof e.className==='string'?e.className:'').split(' ').filter(c=>c&&!c.startsWith('elementor-repeater')).slice(0,4).join('.'), box:[Math.round(r.x),Math.round(r.y+scrollY),Math.round(r.width),Math.round(r.height)], st};
        const txt=[...e.childNodes].filter(c=>c.nodeType===3).map(c=>c.textContent).join('').trim(); if(txt) n.text=txt;
        for(const a of ['href','src','alt','title','srcset']) if(e.getAttribute && e.getAttribute(a)) n[a]=e.getAttribute(a);
        if(tn==='img') n.src=e.currentSrc||e.src;
        if(tn==='svg'){ n.svg=e.outerHTML; return n; }
        const bf=getComputedStyle(e,'::before'); if(bf.content!=='none' && (bf.backgroundColor!=='rgba(0, 0, 0, 0)'||bf.backgroundImage!=='none')) n.before={bg:bf.backgroundColor,bgi:bf.backgroundImage,op:bf.opacity};
        n.ch=[...e.children].map(c=>walk(c,d+1)).filter(Boolean); return n; };
      o[id]=walk(root,0);
    }
    return o;
  }, ids);
  await pg.close();
}
fs.writeFileSync(out, JSON.stringify(res));
await b.close();
