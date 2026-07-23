/* piR2 — hero signal: index fingertip force (solid) overlaid with the GT index-joint
   action (dashed), real grasp data from PROPRIO_DATA, each per-trace normalized so
   their tight correlation is visible: the action tracks the force. Split across the
   two canvases flanking the title; a dot sweeps left->right, ripples/glows when the
   force is reacting, and the grasp/contact caption pops as it enters a labeled region. */
(function () {
  "use strict";
  const canvases = [...document.querySelectorAll(".hero-wave")];
  if (!canvases.length) return;
  const C_IDX = "#0e9e8f", C_ACT = "#7c5cff", DIM = "#cfd6df", ACT_DIM = "rgba(124,92,255,.26)";
  const PADX = 10, BAND = 16;

  let F = null, GA = null, REG = [], L = 0, SP = 0;
  function load() {
    if (L) return true;
    const d = window.PROPRIO_DATA, t = d && (d.book || d.box || d.spill);
    if (!t || !t.force || !t.force.length) return false;
    const nz = a => { const m = Math.max.apply(null, a) || 1; return a.map(v => v / m); };   // per-trace normalize so the correlation is visible despite different amplitudes
    const ga = t.gt_actions && t.gt_actions["hand: index j1"];
    F = nz(t.force); GA = ga ? nz(ga) : null; REG = t.regions || []; L = F.length;
    // split the signal across the two canvases at a quiet gap near the middle, so no
    // grasp region (or its label) is cut across the piR2 title
    const mid = (L - 1) / 2, inReg = x => REG.some(r => x >= r[0] && x <= r[1]);
    SP = mid;
    if (inReg(mid)) for (let dd = 1; dd < L / 2; dd++) { if (!inReg(mid - dd)) { SP = mid - dd; break; } if (!inReg(mid + dd)) { SP = mid + dd; break; } }
    return true;
  }
  const at = (arr, i) => { const x = Math.max(0, Math.min(L - 1, i)), a = Math.floor(x), b = Math.min(L - 1, a + 1); return 0.1 + 0.8 * (arr[a] + (arr[b] - arr[a]) * (x - a)); };

  const waves = canvases.map((c, k) => ({ c, ctx: c.getContext("2d"), k }));
  const n = waves.length;
  let p = 0, last = null;
  function resize() { const dpr = window.devicePixelRatio || 1; for (const o of waves) { const w = o.c.clientWidth || 190, h = 60; o.c.width = w * dpr; o.c.height = h * dpr; o.c.style.height = h + "px"; o.ctx.setTransform(dpr, 0, 0, dpr, 0, 0); } }
  function geo(H) { const top = BAND, bot = H - 6; return { mid: (top + bot) / 2, amp: bot - top }; }

  function drawWave(o, ts) {
    const ctx = o.ctx, W = o.c.clientWidth, H = o.c.clientHeight, { mid, amp } = geo(H);
    const i0 = o.k === 0 ? 0 : SP, i1 = o.k === 0 ? SP : (L - 1);               // split at the quiet gap SP, not the exact middle
    const x = i => PADX + (W - 2 * PADX) * ((i - i0) / (i1 - i0));
    const y = (arr, i) => mid - (at(arr, i) - 0.5) * amp;
    ctx.clearRect(0, 0, W, H);

    function trace(arr, color, dim, lw, dash) {
      ctx.setLineDash(dash || []);
      ctx.strokeStyle = dim; ctx.lineWidth = lw; ctx.beginPath();
      for (let i = Math.floor(i0); i <= Math.ceil(i1); i++) { const px = x(i), py = y(arr, i); i === Math.floor(i0) ? ctx.moveTo(px, py) : ctx.lineTo(px, py); } ctx.stroke();
      const upto = Math.min(p, i1);
      if (upto >= i0) { ctx.strokeStyle = color; ctx.lineWidth = lw + 0.6; ctx.beginPath(); for (let i = Math.floor(i0); i <= upto; i++) { const px = x(i), py = y(arr, i); i === Math.floor(i0) ? ctx.moveTo(px, py) : ctx.lineTo(px, py); } ctx.lineTo(x(upto), y(arr, upto)); ctx.stroke(); }
      ctx.setLineDash([]);
    }
    if (GA) trace(GA, C_ACT, ACT_DIM, 1.6, [4, 3]);   // GT index-joint action (dashed) — tracks the force
    trace(F, C_IDX, DIM, 2.2);                          // index fingertip force (solid)

    if (o.k === 0) {                       // tiny in-canvas legend in the clear top strip (no page height, no curve overlap)
      ctx.font = "600 8.5px ui-monospace,Menlo,monospace"; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillStyle = C_IDX; ctx.fillRect(PADX, 4, 6, 5);
      ctx.fillStyle = "#9aa3ae"; ctx.fillText("index force", PADX + 9, 10);
      const x2 = PADX + 9 + ctx.measureText("index force").width + 9;
      ctx.strokeStyle = C_ACT; ctx.lineWidth = 1.6; ctx.setLineDash([3, 2]); ctx.beginPath(); ctx.moveTo(x2, 6.5); ctx.lineTo(x2 + 9, 6.5); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = "#9aa3ae"; ctx.fillText("Action", x2 + 13, 10);
    }

    if (p >= i0 && p <= i1) {            // the dot lives on this canvas right now
      const dx = x(p), dy = y(F, p);
      // no labels -- just a visual highlight at the moments where the action reacts
      // to the proprioceptive force (force rising sharply -> the GT action tracks it)
      const react = Math.max(0, Math.min(1, (at(F, p) - at(F, p - 4)) * 5));
      if (react > 0.1) {                                    // two expanding ripples -> a clear "pulse" of reaction
        for (let j = 0; j < 2; j++) {
          const ph = ((ts / 620) + j * 0.5) % 1;
          ctx.beginPath(); ctx.arc(dx, dy, 4 + ph * 17, 0, 7);
          ctx.strokeStyle = `rgba(124,92,255,${react * (1 - ph) * 0.8})`; ctx.lineWidth = 2; ctx.stroke();
        }
      }
      const pulse = 0.5 + 0.5 * Math.sin(ts / 1000 * 4);
      ctx.beginPath(); ctx.arc(dx, dy, 4.5 + 3 * pulse + react * 6, 0, 7); ctx.fillStyle = `rgba(14,158,143,${0.13 + react * 0.26})`; ctx.fill();
      ctx.beginPath(); ctx.arc(dx, dy, 3.4, 0, 7); ctx.fillStyle = C_IDX; ctx.fill();
    }
  }

  function frame(ts) {
    if (last == null) last = ts; const dt = Math.min(0.05, (ts - last) / 1000); last = ts;
    if (load()) { p += dt * (L / 5); if (p >= L - 1) p = 0; for (const o of waves) drawWave(o, ts); }
    requestAnimationFrame(frame);
  }
  window.addEventListener("resize", resize); resize(); requestAnimationFrame(frame);
})();
