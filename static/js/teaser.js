/* piR2 teaser reel: play the ours rollouts one after another in a single frame.
   For a window of each clip, zoom in to highlight the closed-loop reactive moment.
   The zoom windows (z = [startFrac, endFrac] of the clip) and focus point (o =
   transform-origin) are placeholders -- adjust per clip to the real reactive beat. */
(function () {
  "use strict";
  const v = document.getElementById("teaser-reel");
  if (!v) return;
  const lab = document.getElementById("reel-lab"), zl = document.getElementById("reel-zoom");
  const list = [
    { src: "static/videos/box_ours.mp4",   name: "Insert Box",    z: [0.50, 0.72], o: "50% 45%" },
    { src: "static/videos/book_ours.mp4",  name: "Tidy Up Book",  z: [0.45, 0.68], o: "50% 45%" },
    { src: "static/videos/spill_ours.mp4", name: "Don't Spill",   z: [0.55, 0.80], o: "55% 45%" },
  ];
  const ZOOM = false;   // re-enable once real reactive windows (z = [startFrac,endFrac]) are set per clip
  let i = 0;
  function load() { const it = list[i]; v.src = it.src; lab.textContent = it.name; v.style.transform = "none"; if (zl) zl.style.display = "none"; v.play().catch(() => {}); }
  v.addEventListener("ended", () => { i = (i + 1) % list.length; load(); });
  if (ZOOM) v.addEventListener("timeupdate", () => {
    const it = list[i], d = v.duration; if (!d) return;
    const f = v.currentTime / d, on = f >= it.z[0] && f <= it.z[1];
    v.style.transformOrigin = it.o; v.style.transform = on ? "scale(1.55)" : "none";
    if (zl) zl.style.display = on ? "" : "none";
  });
  v.addEventListener("canplay", () => v.play().catch(() => {}));
  load();
})();
