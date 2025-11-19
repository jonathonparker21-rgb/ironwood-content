// admin-upload-ui-patch.js
(function(){
  function $(id){ return document.getElementById(id); }
  function ensureBar(id, label){
    let wrap = document.getElementById(id);
    if(!wrap){
      wrap = document.createElement('div');
      wrap.id = id;
      wrap.style.margin = '8px 0 6px';
      wrap.innerHTML = `
        <div style="font-size:12px;opacity:.8;margin-bottom:4px;">${label}</div>
        <div style="height:8px;border:1px solid #1a2128;border-radius:8px;overflow:hidden;background:#0b0e11">
          <div data-bar style="height:8px;width:0%"></div>
        </div>
        <div data-note style="font-size:12px;opacity:.7;margin-top:4px"></div>
      `;
    }
    return wrap;
  }
  function setBar(wrap, pct, ok){
    const bar = wrap.querySelector('[data-bar]');
    const note = wrap.querySelector('[data-note]');
    if(bar){
      bar.style.width = Math.max(0, Math.min(100, pct)) + '%';
      bar.style.background = ok ? 'var(--brand,#dc2626)' : '#64748b';
    }
    if(note){
      note.textContent = Math.round(pct) + '%';
    }
  }
  function toast(msg, ok){
    try{
      if(window.toast) return window.toast(msg, ok !== false);
    }catch(_){}
    const t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText =
      'position:fixed;right:12px;bottom:12px;background:#111827;color:white;' +
      'padding:10px 12px;border:1px solid #1f2937;border-radius:10px;' +
      'z-index:9999;font-size:13px';
    document.body.appendChild(t);
    setTimeout(()=>t.remove(), 2200);
  }
  if(typeof ghPutB64 !== 'function' || typeof ghGet !== 'function' || typeof ghPut !== 'function'){
    console.warn('[admin patch] GitHub helpers not found; load after admin scripts.');
    return;
  }
  const equipBtn = document.getElementById('equip_photos_upload');
  const equipInput = document.getElementById('equip_photos');
  if(equipBtn && equipInput){
    let bar = ensureBar('equip_progress', 'Uploading equipment photos…');
    equipBtn.parentElement && equipBtn.parentElement.parentElement && equipBtn.parentElement.parentElement.appendChild(bar);
    equipBtn.addEventListener('click', async function(){
      try{
        const files = Array.from(equipInput.files||[]);
        if(!files.length) return toast('Pick photos first', false);
        setBar(bar, 5, true);
        try{ await ghPut('equipment/.keep','keep','ensure folder'); }catch(_){}
        try{ await ghPut('equipment/photos/.keep','keep','ensure folder'); }catch(_){}
        let done = 0;
        for(const f of files){
          await new Promise((resolve,reject)=>{
            const fr = new FileReader();
            fr.onprogress = (e)=>{
              if(e.lengthComputable){
                const pct = 5 + (e.loaded/e.total)*80 * (1/files.length) + (done/files.length)*80;
                setBar(bar, pct, true);
              }
            };
            fr.onload = async ()=>{
              try{
                const dataUrl = String(fr.result);
                const b64 = dataUrl.split(',')[1] || '';
                const safe = (Date.now()+'-'+f.name).replace(/\s+/g,'_');
                await ghPutB64('equipment/photos/'+safe, b64, 'admin: upload equipment photo');
                done++;
                const pct = 5 + (done/files.length)*80;
                setBar(bar, pct, true);
                resolve();
              }catch(e){ reject(e); }
            };
            fr.onerror = ()=>reject(fr.error||new Error('read fail'));
            fr.readAsDataURL(f);
          });
        }
        setBar(bar, 90, true);
        await new Promise(r=>setTimeout(r, 700));
        try{ if(typeof refreshEquipPhotosFromDirToConfig==='function'){ await refreshEquipPhotosFromDirToConfig(); } }catch(_){}
        if(typeof listEquipPhotos==='function'){
          await listEquipPhotos();
          const imgs = document.querySelectorAll('#equip_photos_list img');
          imgs.forEach(img=>{ img.src = img.src.replace(/\?v=\d+$/, '') + '?v=' + Date.now(); });
        }
        setBar(bar, 100, true);
        toast('Equipment photos uploaded ✅', true);
        equipInput.value='';
      }catch(e){
        toast('Upload failed: ' + (e && e.message ? e.message : e), false);
        setBar(bar, 100, false);
      }
    });
  }
  const dumpBtn = document.getElementById('dump_photos_upload');
  const dumpInput = document.getElementById('dump_photos');
  if(dumpBtn && dumpInput){
    let bar = ensureBar('dump_progress', 'Uploading dumpster photos…');
    dumpBtn.parentElement && dumpBtn.parentElement.parentElement && dumpBtn.parentElement.parentElement.appendChild(bar);
    dumpBtn.addEventListener('click', async function(){
      try{
        const files = Array.from(dumpInput.files||[]);
        if(!files.length) return toast('Pick photos first', false);
        setBar(bar, 5, true);
        try{ await ghPut('dumpsters/.keep','keep','ensure folder'); }catch(_){}
        try{ await ghPut('dumpsters/photos/.keep','keep','ensure folder'); }catch(_){}
        let done = 0;
        for(const f of files){
          await new Promise((resolve,reject)=>{
            const fr = new FileReader();
            fr.onprogress = (e)=>{
              if(e.lengthComputable){
                const pct = 5 + (e.loaded/e.total)*80 * (1/files.length) + (done/files.length)*80;
                setBar(bar, pct, true);
              }
            };
            fr.onload = async ()=>{
              try{
                const dataUrl = String(fr.result);
                const b64 = dataUrl.split(',')[1] || '';
                const safe = (Date.now()+'-'+f.name).replace(/\s+/g,'_');
                await ghPutB64('dumpsters/photos/'+safe, b64, 'admin: upload dumpster photo');
                done++;
                const pct = 5 + (done/files.length)*80;
                setBar(bar, pct, true);
                resolve();
              }catch(e){ reject(e); }
            };
            fr.onerror = ()=>reject(fr.error||new Error('read fail'));
            fr.readAsDataURL(f);
          });
        }
        setBar(bar, 90, true);
        await new Promise(r=>setTimeout(r, 700));
        try{ if(typeof refreshDumpPhotosFromDirToConfig==='function'){ await refreshDumpPhotosFromDirToConfig(); } }catch(_){}
        if(typeof listDumpPhotos==='function'){
          await listDumpPhotos();
          const imgs = document.querySelectorAll('#dump_photos_list img');
          imgs.forEach(img=>{ img.src = img.src.replace(/\?v=\d+$/, '') + '?v=' + Date.now(); });
        }
        setBar(bar, 100, true);
        toast('Dumpster photos uploaded ✅', true);
        dumpInput.value='';
      }catch(e){
        toast('Upload failed: ' + (e && e.message ? e.message : e), false);
        setBar(bar, 100, false);
      }
    });
  }
})();