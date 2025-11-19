// carousel-cache-bust-patch.js
(function(){
  function bust(src){
    if(!src) return src;
    if(/\?v=\d+$/.test(src)) return src;
    return src + (src.includes('?') ? '&' : '?') + 'v=' + Date.now();
  }
  function apply(id){
    const track = document.getElementById(id);
    if(!track) return;
    Array.from(track.querySelectorAll('img')).forEach(img=>{
      const current = img.getAttribute('src');
      const next = bust(current);
      if(next !== current){
        img.setAttribute('src', next);
      }
    });
  }
  function updateEmptyStates(){
    const equipTrack = document.getElementById('equipment-track');
    const equipEmpty = document.getElementById('equipment-empty');
    if(equipTrack && equipEmpty){
      const hasImg = !!equipTrack.querySelector('img');
      equipEmpty.style.display = hasImg ? 'none' : '';
    }
    const dumpTrack = document.getElementById('dumpster-track');
    const dumpEmpty = document.getElementById('dump-empty');
    if(dumpTrack && dumpEmpty){
      const hasImgD = !!dumpTrack.querySelector('img');
      dumpEmpty.style.display = hasImgD ? 'none' : '';
    }
  }
  function watch(id){
    const node = document.getElementById(id);
    if(!node) return;
    const obs = new MutationObserver(()=>{ apply(id); updateEmptyStates(); });
    obs.observe(node, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] });
    apply(id);
    updateEmptyStates();
  }
  window.addEventListener('load', function(){
    watch('equipment-track');
    watch('dumpster-track');
  });
})();