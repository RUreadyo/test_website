/* tabs + lazy video */
(function () {
  "use strict";
  // task tabs
  document.querySelectorAll("[data-tabgroup]").forEach(group => {
    const g = group.getAttribute("data-tabgroup");
    const tabs = document.querySelectorAll(`.tab[data-tab="${g}"]`);
    const panels = document.querySelectorAll(`[data-panel="${g}"]`);
    tabs.forEach(t => t.addEventListener("click", () => {
      tabs.forEach(x => x.classList.remove("active"));
      panels.forEach(p => p.style.display = "none");
      t.classList.add("active");
      const tgt = document.querySelector(`[data-panel="${g}"][data-key="${t.dataset.key}"]`);
      if (tgt) tgt.style.display = "";
      panels.forEach(p => p.querySelectorAll("video").forEach(v => { v.pause(); v.loop = true; }));   // stop old panel, restore loop
      const pab = document.querySelector(`.playall[data-group="${g}"]`);                              // reset play-all label for the new task
      if (pab) pab.textContent = "▶ Play all";
    }));
  });
  // pause offscreen videos
  const io = new IntersectionObserver(es => es.forEach(e => {
    const v = e.target; if (!e.isIntersecting && !v.paused) v.pause();
  }), { threshold: 0.1 });
  document.querySelectorAll("video").forEach(v => io.observe(v));

  // play-all: sync-play every video in the active panel of a tab group
  document.querySelectorAll(".playall").forEach(btn => {
    btn.addEventListener("click", () => {
      const g = btn.dataset.group;
      let panel = null;
      document.querySelectorAll(`[data-panel="${g}"]`).forEach(p => { if (p.style.display !== "none") panel = p; });
      if (!panel) return;
      const vids = panel.querySelectorAll("video");
      const playing = [...vids].some(v => !v.paused && !v.ended);
      vids.forEach(v => { if (playing) { v.pause(); v.loop = true; } else { v.loop = false; try { v.currentTime = 0; } catch (e) {} v.play().catch(() => {}); } });
      btn.textContent = playing ? "▶ Play all" : "❚❚ Pause all";
    });
  });

  // teleop comparison: hide native fullscreen too (side-by-side, single-video FS breaks it)
  document.querySelectorAll('[data-panel="tele"] video').forEach(v => { v.setAttribute("controlsList", "nofullscreen"); try { v.disablePictureInPicture = true; } catch (e) {} });

  // ---- ✓/✗ success badges ----
  const S = window.SUCCESS, MN = window.MAIN_N;
  if (!S) return;
  const chip = ok => { const s = document.createElement("span"); s.className = "sbadge " + (ok ? "ok" : "no"); s.textContent = ok ? "✓" : "✕"; return s; };
  // show the outcome only near the end of the clip (result known once the rollout finishes)
  const gateOnEnd = (vid, el) => {
    const upd = () => { const d = vid.duration; el.classList.toggle("show", d && vid.currentTime >= d * 0.82); };
    vid.addEventListener("timeupdate", upd); vid.addEventListener("seeked", upd); upd();
  };
  // Use the video's native fullscreen only (one maximize button). Disable PiP so there's
  // no extra maximize-looking icon. (DOM ✓/✗ overlay isn't shown in native fullscreen.)
  const addFsBtn = (wrap, vid) => { if (vid) { try { vid.disablePictureInPicture = true; } catch (e) {} } };

  // 2x2 main comparison: cell[data-task][data-method]
  document.querySelectorAll(".vcell[data-task][data-method]").forEach(cell => {
    if (cell.closest('[data-panel="tele"]')) return;   // skip teleop comparison
    const t = cell.dataset.task, m = cell.dataset.method, mn = MN[t], n = ((typeof mn === "object" ? (mn[m] || 1) : (mn || 1))) - 1, vid = cell.querySelector("video");
    if (S[t] && S[t][m] && vid) {
      const ok = S[t][m][n] === 1; const b = chip(ok); cell.appendChild(b);
      cell.classList.add("gate", ok ? "res-ok" : "res-no");
      gateOnEnd(vid, cell); addFsBtn(cell, vid);
    }
  });

  // rollout grids: overlay 5x4 badges over .gv[data-task][data-method]
  document.querySelectorAll(".gv[data-task][data-method]").forEach(gv => {
    const t = gv.dataset.task, m = gv.dataset.method, arr = S[t] && S[t][m];
    const vid = gv.querySelector("video");
    if (!arr || !vid) return;
    const box = document.createElement("div"); box.className = "gvid";
    vid.parentNode.insertBefore(box, vid); box.appendChild(vid);
    const ov = document.createElement("div"); ov.className = "grid-badges";
    arr.forEach(v => { const c = document.createElement("span"); c.className = "gb " + (v ? "ok" : "no"); const g = document.createElement("span"); g.textContent = v ? "✓" : "✕"; c.appendChild(g); ov.appendChild(c); });
    box.appendChild(ov);
    gateOnEnd(vid, ov); addFsBtn(box, vid);
  });
})();
