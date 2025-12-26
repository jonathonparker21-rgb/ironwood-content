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
      const next = bust(img.getAttribute('src'));
      if(next !== img.getAttribute('src')) img.setAttribute('src', next);
    });
  }
  function watch(id){
    const node = document.getElementById(id);
    if(!node) return;
    const obs = new MutationObserver(()=>apply(id));
    obs.observe(node, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] });
    apply(id);
  }
  window.addEventListener('load', function(){
    watch('equipment-track');
    watch('dumpster-track');
  });
})();