// carousel-cache-bust-patch.js
// Optional helper: cache-busts images inside the equipment & dumpster carousels
(function () {
  function bust(src) {
    if (!src) return src;
    if (/\?v=\d+$/.test(src)) return src;
    return src + (src.includes("?") ? "&" : "?") + "v=" + Date.now();
  }

  function apply(id) {
    const track = document.getElementById(id);
    if (!track) return;
    Array.from(track.querySelectorAll("img")).forEach((img) => {
      const current = img.getAttribute("src");
      const next = bust(current);
      if (next !== current) {
        img.setAttribute("src", next);
      }
    });
  }

  window.addEventListener("load", function () {
    apply("equipment-track");
    apply("dumpster-track");
  });
})();
