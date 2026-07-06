/* piR2 — hero signal: ONE static fingertip-force curve (index + thumb, real grasp
   data from PROPRIO_DATA) split across the canvases that flank the title. A single
   dot sweeps continuously left->right through the whole signal (left canvas, then
   right), so piR2 stays centered between the two halves. The grasp/contact caption
   pops above the dot as it enters each labeled region. */
(function () {
  "use strict";
  const canvases = [...document.querySelectorAll(".hero-wave")];
  if (!canvases.length) return;
  const C_IDX = "#0e9e8f", C_THB = "#e0843a", DIM = "#cfd6df", THB_DIM = "rgba(224,132,58,.34)";
  const PADX = 10, BAND = 16;

  let F = null, TH = null, REG = [], L = 0;
  function load() {
    if (L) return true;
    const d = window.PROPRIO_DATA, t = d && (d.box || d.book || d.spill);
    if (!t || !t.force || !t.force.length) return false;
    F = t.force; TH = t.thumb || null; REG = t.regions || []; L = F.length; return true;
  }
  const at = (arr, i) => { const x = Math.max(0, Math.min(L - 1, i)), a = Math.floor(x), b = Math.min(L - 1, a + 1); return 0.1 + 0.8 * (arr[a] + (arr[b] - arr[a]) * (x - a)); };

  const waves = canvases.map((c, k) => ({ c, ctx: c.getContext("2d"), k }));
  const n = waves.length;
  let p = 0, last = null;
  function resize() { const dpr = window.devicePixelRatio || 1; for (const o of waves) { const w = o.c.clientWidth || 190, h = 60; o.c.width = w * dpr; o.c.height = h * dpr; o.c.style.height = h + "px"; o.ctx.setTransform(dpr, 0, 0, dpr, 0, 0); } }
  function geo(H) { const top = BAND, bot = H - 6; return { mid: (top + bot) / 2, amp: bot - top }; }

  function drawWave(o, ts) {
    const ctx = o.ctx, W = o.c.clientWidth, H = o.c.clientHeight, { mid, amp } = geo(H);
    const span = (L - 1) / n, i0 = o.k * span, i1 = (o.k + 1) * span;          // this canvas covers signal [i0, i1]
    const x = i => PADX + (W - 2 * PADX) * ((i - i0) / (i1 - i0));
    const y = (arr, i) => mid - (at(arr, i) - 0.5) * amp;
    ctx.clearRect(0, 0, W, H);

    function trace(arr, color, dim, lw) {
      ctx.strokeStyle = dim; ctx.lineWidth = lw; ctx.beginPath();
      for (let i = Math.floor(i0); i <= Math.ceil(i1); i++) { const px = x(i), py = y(arr, i); i === Math.floor(i0) ? ctx.moveTo(px, py) : ctx.lineTo(px, py); } ctx.stroke();
      const upto = Math.min(p, i1);
      if (upto >= i0) { ctx.strokeStyle = color; ctx.lineWidth = lw + 0.6; ctx.beginPath(); for (let i = Math.floor(i0); i <= upto; i++) { const px = x(i), py = y(arr, i); i === Math.floor(i0) ? ctx.moveTo(px, py) : ctx.lineTo(px, py); } ctx.lineTo(x(upto), y(arr, upto)); ctx.stroke(); }
    }
    if (TH) trace(TH, C_THB, THB_DIM, 1.5);
    trace(F, C_IDX, DIM, 2.2);

    if (o.k === 0) {                       // tiny in-canvas legend in the clear top strip (no page height, no curve overlap)
      ctx.font = "600 8.5px ui-monospace,Menlo,monospace"; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillStyle = C_IDX; ctx.fillRect(PADX, 3, 6, 6);
      ctx.fillStyle = "#9aa3ae"; ctx.fillText("index", PADX + 9, 10);
      const x2 = PADX + 9 + ctx.measureText("index").width + 8;
      ctx.fillStyle = C_THB; ctx.fillRect(x2, 3, 6, 6);
      ctx.fillStyle = "#9aa3ae"; ctx.fillText("thumb", x2 + 9, 10);
      ctx.fillText("· fingertip force", x2 + 9 + ctx.measureText("thumb").width + 6, 10);
    }

    if (p >= i0 && p <= i1) {            // the dot lives on this canvas right now
      const dx = x(p), dy = y(F, p);
      let label = null; for (const r of REG) if (p >= r[0] && p <= r[1]) { label = r[2]; break; }
      if (label) {
        ctx.font = "700 11px ui-monospace,Menlo,monospace"; ctx.textAlign = "center"; ctx.textBaseline = "top";
        const tw = ctx.measureText(label).width, lx = Math.max(tw / 2 + 6, Math.min(W - tw / 2 - 6, dx));
        const ly = o.k === 0 ? 14 : 1;   // left canvas: drop below the fingertip-force legend
        ctx.fillStyle = "#0e9e8f"; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(lx - tw / 2 - 6, ly, tw + 12, 15, 5) : ctx.rect(lx - tw / 2 - 6, ly, tw + 12, 15); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.fillText(label, lx, ly + 2);
      }
      const pulse = 0.5 + 0.5 * Math.sin(ts / 1000 * 4);
      ctx.beginPath(); ctx.arc(dx, dy, 4.5 + 3 * pulse, 0, 7); ctx.fillStyle = `rgba(14,158,143,${0.16 * (1 - pulse) + 0.05})`; ctx.fill();
      ctx.beginPath(); ctx.arc(dx, dy, 3.4, 0, 7); ctx.fillStyle = C_IDX; ctx.fill();
    }
  }

  function frame(ts) {
    if (last == null) last = ts; const dt = Math.min(0.05, (ts - last) / 1000); last = ts;
    if (load()) { p += dt * (L / 9); if (p >= L - 1) p = 0; for (const o of waves) drawWave(o, ts); }
    requestAnimationFrame(frame);
  }
  window.addEventListener("resize", resize); resize(); requestAnimationFrame(frame);
})();
