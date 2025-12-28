(function(){
  const KEY = 'ironwood_webapp_prompt_seen_v1';
  if (typeof window === 'undefined' || localStorage.getItem(KEY)) return;

  const style = document.createElement('style');
  style.textContent = `
    .iw-prompt-backdrop{
      position:fixed;inset:0;display:flex;align-items:center;justify-content:center;
      background:rgba(0,0,0,0.55);backdrop-filter:blur(6px);z-index:9998;
      opacity:0;transition:opacity .18s ease;
    }
    .iw-prompt{background:#0b1120;border:1px solid #1f2937;border-radius:14px;
      padding:16px;max-width:360px;width:min(92vw,380px);box-shadow:0 18px 46px rgba(0,0,0,0.35);
      color:#e5e7eb;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
    }
    .iw-prompt h4{margin:0 0 6px;font-size:1.05rem}
    .iw-prompt p{margin:0 0 10px;color:#9ca3af;font-size:0.95rem;line-height:1.4}
    .iw-prompt .iw-actions{display:flex;gap:8px;flex-wrap:wrap}
    .iw-btn{flex:1 1 auto;display:inline-flex;justify-content:center;align-items:center;gap:.4rem;
      background:linear-gradient(145deg,#1f2937,#0f172a);color:#ffdddd;border-radius:10px;
      padding:.6rem 1rem;border:1px solid rgba(220,38,38,.45);font-weight:700;cursor:pointer;
      box-shadow:0 0 0 rgba(220,38,38,.25);transition:box-shadow .12s,border-color .12s,transform .08s,filter .12s;
    }
    .iw-btn:hover{filter:brightness(1.05);border-color:rgba(252,165,165,.9);box-shadow:0 0 14px rgba(220,38,38,.35);transform:translateY(-1px);}
    .iw-btn.ghost{background:linear-gradient(145deg,#0f172a,#0b1220);border:1px solid #2b333b;color:#e5e7eb;box-shadow:none;}
    .iw-btn.ghost:hover{border-color:rgba(220,38,38,.5);box-shadow:0 0 10px rgba(220,38,38,.25);}
  `;
  document.head.appendChild(style);

  const backdrop = document.createElement('div');
  backdrop.className = 'iw-prompt-backdrop';
  const panel = document.createElement('div');
  panel.className = 'iw-prompt';
  panel.innerHTML = `
    <h4>Save Ironwood as a web app</h4>
    <p>For quick access on your phone or tablet, add us to your home screen. On iPhone: Share → "Add to Home Screen". On Android/Chrome: menu → "Add to Home screen".</p>
    <div class="iw-actions">
      <button class="iw-btn" id="iw-okay">Got it</button>
      <button class="iw-btn ghost" id="iw-dismiss">Maybe later</button>
    </div>
  `;
  backdrop.appendChild(panel);
  document.body.appendChild(backdrop);

  function closePrompt(){
    localStorage.setItem(KEY, '1');
    backdrop.style.opacity = '0';
    setTimeout(()=>backdrop.remove(), 180);
    window.removeEventListener('keydown', esc);
  }
  function esc(e){ if(e.key === 'Escape') closePrompt(); }
  backdrop.querySelector('#iw-okay').onclick = closePrompt;
  backdrop.querySelector('#iw-dismiss').onclick = closePrompt;
  backdrop.addEventListener('click', (e)=>{ if(e.target === backdrop) closePrompt(); });
  setTimeout(()=>{ backdrop.style.opacity='1'; }, 80);
  window.addEventListener('keydown', esc);
})();
