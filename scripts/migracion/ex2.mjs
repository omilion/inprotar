import puppeteer from 'puppeteer-core';
import fs from 'fs';
// uso: node ex2.mjs outDir ruta1 ruta2 ...
const [,, outDir, ...paths] = process.argv;
const b = await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:'new'});

async function extract(path, W){
  const pg = await b.newPage(); await pg.setViewport({width:W,height:900,isMobile:W<800,hasTouch:W<800});
  await pg.goto('https://inprotar.cl/'+path, {waitUntil:'networkidle2', timeout:120000});
  await pg.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=400){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,90));} window.scrollTo(0,0);});
  await pg.addStyleTag({content:'.elementor-invisible{visibility:visible!important;opacity:1!important} .animated{animation:none!important} *{transition:none!important}'});
  await new Promise(r=>setTimeout(r,1500));
  const data = await pg.evaluate(() => {
    const cs = (e,p) => getComputedStyle(e,p);
    const R = e => { const r=e.getBoundingClientRect(); return [Math.round(r.x*10)/10, Math.round((r.y+scrollY)*10)/10, Math.round(r.width*10)/10, Math.round(r.height*10)/10]; };
    const CON=['display','flexDirection','flexWrap','justifyContent','alignItems','alignSelf','gap','rowGap','columnGap','paddingTop','paddingRight','paddingBottom','paddingLeft','marginTop','marginRight','marginBottom','marginLeft','backgroundColor','backgroundImage','backgroundSize','backgroundPosition','backgroundRepeat','minHeight','maxWidth','borderTopWidth','borderRightWidth','borderBottomWidth','borderLeftWidth','borderTopStyle','borderTopColor','borderRightStyle','borderRightColor','borderBottomStyle','borderBottomColor','borderLeftStyle','borderLeftColor','borderRadius','boxShadow','position','top','left','right','bottom','zIndex','flexGrow','flexShrink','flexBasis','overflow','textAlign','order','height'];
    const TXT=['fontFamily','fontSize','fontWeight','fontStyle','color','lineHeight','letterSpacing','textTransform','textAlign','textDecorationLine','textShadow','marginTop','marginBottom','marginLeft','marginRight','paddingTop','paddingRight','paddingBottom','paddingLeft','backgroundColor','borderRadius','wordSpacing'];
    const BTN=['fontFamily','fontSize','fontWeight','fontStyle','color','lineHeight','letterSpacing','textTransform','backgroundColor','backgroundImage','paddingTop','paddingRight','paddingBottom','paddingLeft','borderTopWidth','borderTopStyle','borderTopColor','borderRadius','boxShadow','width','display','textAlign'];
    const pick=(e,K,p)=>{const c=cs(e,p),o={};for(const k of K)o[k]=c[k];return o;};
    const vis = e => cs(e).display!=='none';
    function shapes(c){ return [...c.querySelectorAll(':scope > .elementor-shape, :scope > .e-con-inner > .elementor-shape')].map(s=>{const svg=s.querySelector('svg'); return {pos:s.classList.contains('elementor-shape-top')?'top':'bottom', html:svg?svg.outerHTML:'', h:svg?cs(svg).height:'', w:svg?cs(svg).width:'', tr:svg?cs(svg).transform:'', fill:s.querySelector('path')?cs(s.querySelector('path')).fill:''};}); }
    function walk(el){
      const out=[];
      for (const c of el.children){
        const cl=c.classList;
        if (cl.contains('e-con')){
          const inner = c.querySelector(':scope > .e-con-inner');
          const n={k:'con', id:c.dataset.id, cls:[...cl].filter(x=>x.startsWith('elementor-hidden')||x==='e-con-boxed'||x==='e-con-full'), box:R(c), vis:vis(c), css:pick(c,CON)};
          const bf=pick(c,['content','backgroundColor','backgroundImage','opacity','backgroundSize','backgroundPosition','mixBlendMode'],'::before'); if(bf.content!=='none') n.before=bf;
          const ml=c.querySelector(':scope > .elementor-motion-effects-container > .elementor-motion-effects-layer'); if(ml){n.layer=pick(ml,['backgroundColor','backgroundImage','backgroundSize','backgroundPosition','backgroundRepeat']); const mb=pick(ml,['content','backgroundColor','backgroundImage','opacity'],'::before'); if(mb.content!=='none') n.layerBefore=mb;}
          if (c.dataset.settings && c.dataset.settings.includes('background_video_link')) n.videoLink=JSON.parse(c.dataset.settings).background_video_link;
          if (c.dataset.settings && c.dataset.settings.includes('slideshow')) n.slideshow=c.dataset.settings;
          n.shapes=shapes(c);
          if (c.tagName==='A') n.href=c.getAttribute('href');
          const link=c.dataset.epWrapperLink; if(link) try{n.href=JSON.parse(link).url}catch(e){}
          if (inner){ n.inner={box:R(inner), css:pick(inner,CON)}; n.ch=walk(inner); } else n.ch=walk(c);
          out.push(n);
        } else if (cl.contains('elementor-widget')){
          const t=(c.dataset.widget_type||'').replace('.default','');
          const ct=c.querySelector(':scope > .elementor-widget-container')||c;
          const w={k:'w', t, id:c.dataset.id, cls:[...cl].filter(x=>x.startsWith('elementor-hidden')||x.startsWith('elementor-absolute')), box:R(c), vis:vis(c), css:pick(c,CON), wc:pick(ct,CON)};
          w.anim=c.dataset.settings||'';
          if (t==='heading'){ const h=ct.querySelector('.elementor-heading-title')||ct.firstElementChild; w.tag=h.tagName.toLowerCase(); w.html=h.innerHTML; w.tcss=pick(h,TXT); const a=h.querySelector('a'); if(a){w.acss=pick(a,['color']);} }
          else if (t==='text-editor'||t==='theme-post-content'){ w.html=ct.innerHTML; w.tcss=pick(ct,TXT); const p=ct.querySelector('p'); if(p) w.pcss=pick(p,['marginTop','marginBottom']); const st=ct.querySelector('strong,b'); if(st) w.scss=pick(st,['color','fontWeight']); const a=ct.querySelector('a'); if(a) w.acss=pick(a,['color','textDecorationLine']); }
          else if (t==='image'||t==='theme-post-featured-image'||t==='theme-site-logo'){ const im=ct.querySelector('img'); if(im){w.src=im.currentSrc||im.src; w.alt=im.getAttribute('alt')||''; w.wh=[im.getAttribute('width'),im.getAttribute('height')]; w.icss=pick(im,['width','maxWidth','height','objectFit','objectPosition','borderRadius','boxShadow','opacity','filter','borderTopWidth','borderTopStyle','borderTopColor']); w.ibox=R(im);} const a=ct.querySelector('a'); if(a){w.href=a.getAttribute('href'); w.target=a.target;} const fc=ct.querySelector('figcaption'); if(fc){w.caption=fc.innerText; w.ccss=pick(fc,TXT);} w.align=cs(ct).textAlign; }
          else if (t==='button'){ const a=ct.querySelector('.elementor-button'); w.text=a.innerText.trim(); w.href=a.getAttribute('href'); w.target=a.target; w.bcss=pick(a,BTN); w.align=cs(ct.querySelector('.elementor-button-wrapper')||ct).textAlign; w.bbox=R(a); const ic=a.querySelector('svg'); if(ic) w.icon=ic.outerHTML; }
          else if (t==='bdt-advanced-button'){ const a=ct.querySelector('a'); w.text=a.innerText.trim(); w.html=(a.querySelector('.avdbtn-text')||a).innerHTML; w.href=a.getAttribute('href'); w.target=a.target; w.bcss=pick(a,BTN); w.align=cs(ct.querySelector('.bdt-ep-button-wrapper')||ct).textAlign; w.bbox=R(a); }
          else if (t==='spacer'){ w.h=(ct.querySelector('.elementor-spacer-inner')||ct).getBoundingClientRect().height; }
          else if (t==='divider'){ const s=ct.querySelector('.elementor-divider-separator'); w.dcss=pick(s,['borderTopWidth','borderTopStyle','borderTopColor','width','marginLeft','marginRight']); w.dpad=pick(ct.querySelector('.elementor-divider'),['paddingTop','paddingBottom']); }
          else if (t==='icon'){ const sv=ct.querySelector('svg'); w.svg=sv?sv.outerHTML:''; w.icss=sv?pick(sv,['width','height','fill','color']):{}; w.align=cs(ct.querySelector('.elementor-icon-wrapper')||ct).textAlign; const a=ct.querySelector('a'); if(a) w.href=a.getAttribute('href'); }
          else { w.html=ct.innerHTML; w.tcss=pick(ct,TXT); }
          out.push(w);
        } else out.push(...walk(c));
      }
      return out;
    }
    const all=[...document.querySelectorAll('[data-elementor-type]')].filter(e=>!e.parentElement.closest('[data-elementor-type]'));
    const root=all.find(e=>!['header','footer','popup'].includes(e.dataset.elementorType));
    return {roots:all.map(e=>e.dataset.elementorType+':'+e.dataset.elementorId), type: root&&root.dataset.elementorType, id: root&&root.dataset.elementorId, ch: root?walk(root):[], docH: document.body.scrollHeight};
  });
  await pg.close(); return data;
}
for (const p of paths){
  const n=(p.replace(/\/$/,'').replace(/\//g,'_'))||'home';
  const d=await extract(p,1440); const m=await extract(p,390);
  fs.writeFileSync(`${outDir}/${n}.json`, JSON.stringify({desktop:d, mobile:m}));
  console.log(n, d.roots.join(' '), d.ch.length, 'docH', d.docH);
}
await b.close();
