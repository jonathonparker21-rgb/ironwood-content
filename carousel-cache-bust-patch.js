// carousel-cache-bust-patch.js
// Ironwood Site v1.2.9
(function(){
  function bust(src){
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

  function updateEquipmentEmptyState() {
    const track = document.getElementById("equipment-track");
    const empty = document.getElementById("equipment-empty");
    if (!track || !empty) return;

    const hasImg = !!track.querySelector("img");
    empty.style.display = hasImg ? "none" : "";
  }

  function watch(id) {
    const node = document.getElementById(id);
    if (!node) return;

    const obs = new MutationObserver(() => {
      apply(id);
      if (id === "equipment-track") {
        updateEquipmentEmptyState();
      }
    });

    obs.observe(node, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["src"],
    });

    apply(id);
    if (id === "equipment-track") {
      updateEquipmentEmptyState();
    }
  }

  window.addEventListener("load", function () {
    watch("equipment-track");
    watch("dumpster-track");
    updateEquipmentEmptyState();
  });
})();
