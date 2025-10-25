
function applyTheme(vars){
  const root = document.documentElement;
  Object.keys(vars || {}).forEach(k => {
    if(k.startsWith('--')) root.style.setProperty(k, vars[k]);
  });
}
(function(){
  const slider = document.querySelector('.slider');
  if(!slider) return;
  const before = slider.querySelector('img.before');
  const handle = slider.querySelector('.handle');
  let pct = 50;
  const set = p => {
    pct = Math.max(0, Math.min(100, p));
    before.style.clipPath = `inset(0 ${100-pct}% 0 0)`;
    handle.style.left = pct + '%';
  };
  const onMove = (e) => {
    const r = slider.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
    set( (x / r.width) * 100 );
  };
  slider.addEventListener('pointerdown', e => {
    slider.setPointerCapture(e.pointerId);
    onMove(e);
    slider.addEventListener('pointermove', onMove);
  });
  window.addEventListener('pointerup', e => {
    slider.removeEventListener('pointermove', onMove);
  });
  set(50);
})();

function callNumber(num){ window.location.href = 'tel:' + num; }
function emailTo(addr){ window.location.href = 'mailto:' + addr; }

async function loadJSON(path){
  const res = await fetch(path, {cache:'no-store'});
  return res.json();
}

(async function init(){
  try{
    const [cfg, theme] = await Promise.all([loadJSON('config.json'), loadJSON('theme.json')]);
    applyTheme(theme);
    if(cfg.phone){ document.querySelectorAll('[data-call]').forEach(b => b.setAttribute('onclick', `callNumber('${cfg.phone}')`)); }
    if(cfg.email){ document.querySelectorAll('[data-email]').forEach(b => b.setAttribute('onclick', `emailTo('${cfg.email}')`)); }
    if(cfg.brand){ const el = document.getElementById('brand'); if(el) el.textContent = cfg.brand; const f=document.getElementById('brand-foot'); if(f) f.textContent = cfg.brand; }
    if(cfg.hero_title){ const el = document.getElementById('hero-title'); if(el) el.innerHTML = cfg.hero_title; }
    if(cfg.hero_subtitle){ const el = document.getElementById('hero-sub'); if(el) el.textContent = cfg.hero_subtitle; }
    if(cfg.service_area){ const el = document.getElementById('service-area'); if(el) el.textContent = cfg.service_area; }
    const list = document.getElementById('services');
    if(list && Array.isArray(cfg.services)){
      list.innerHTML = '';
      cfg.services.forEach(s => {
        const d = document.createElement('div');
        d.className = 'kv'; d.innerHTML = `<span class="k">•</span><span class="v">${s}</span>`;
        list.appendChild(d);
      });
    }
  }catch(e){ console.error(e); }
})();
