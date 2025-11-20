(function(){
  const navInner = `
    <a class="brand" href="/index.html">
      <img src="assets/logo-ld-original.png" alt="" style="height:42px">
      <span class="brand-name">Ironwood Land Development</span>
      <span class="brand-tag">NE LA</span>
    </a>
    <nav class="nav-links">
      <a href="/#services">Services</a>
      <a href="/#equipment">Equipment</a>
      <a href="/dumpsters.html">Dumpsters</a>
      <a href="/contact.html">Contact</a>
    </nav>
    <a class="call-chip" href="tel:+13189142351">Call (318) 914-2351</a>
  `;
  document.querySelectorAll('.nav-inner').forEach(el => { el.innerHTML = navInner; });
})();
