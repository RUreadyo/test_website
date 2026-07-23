/* piR2 — real-world results bar chart with a Success-rate / Progress toggle.
   Paper numbers (Table: Real World Results):
     SR:   Spill 4/7/9/10 of 20 ;  Book 4/7/8/12 of 20
     Prog: Spill 16/30/52/58 of 80 ;  Book 9/15/18/24 of 40 */
(function () {
  "use strict";
  const c = document.getElementById("results-canvas");
  if (!c) return;
  const ctx = c.getContext("2d");
  const TASKS = ["Insert Box", "Tidy Up Book", "Don't Spill", "Catch book"];
  const METHODS = [
    { n: "Flow, Synchronous", col: "#b8c0cc" },
    { n: "Naive Async (TE)", col: "#7f8b9c" },
    { n: "Train-Time RTC", col: "#e0568f" },
    { n: "πR² (ours)", col: "#0e9e8f", ours: true },
  ];
  // per task [Spill, Book, Box] x [Sync, NaiveAsync, RTC, ours]
  const DATA = {
    sr:   { vals: [[11, 12, 10, 16], [4, 7, 8, 12], [4, 7, 9, 10], [4, 2, 5, 11]], den: [20, 20, 20, 20], unit: "/20" },
    prog: { vals: [[56, 61, 53, 68], [9, 15, 18, 24], [16, 30, 45, 55], [4, 2, 5, 11]], den: [80, 40, 80, 20], unit: "subgoals" },
  };
  let metric = "sr";

  function resize() {
    const w = c.clientWidth, h = 300, dpr = window.devicePixelRatio || 1;
    c.width = w * dpr; c.height = h * dpr; c.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); draw();
  }
  function draw() {
    const W = c.clientWidth, H = c.clientHeight;
    ctx.clearRect(0, 0, W, H);
    const padL = 44, padR = 14, padT = 14, padB = 44;
    const plotW = W - padL - padR, plotH = H - padT - padB;
    const Y = f => padT + plotH * (1 - f);
    ctx.font = "11px ui-monospace,monospace"; ctx.fillStyle = "#69727f";
    ctx.textAlign = "right"; ctx.textBaseline = "middle"; ctx.strokeStyle = "#e9ecf1";
    for (let g = 0; g <= 1.0; g += 0.25) { const y = Y(g); ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(W - padR, y); ctx.stroke(); ctx.fillText(Math.round(g * 100) + "%", padL - 7, y); }
    ctx.save(); ctx.translate(12, padT + plotH / 2); ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center"; ctx.fillStyle = "#69727f";
    ctx.fillText(metric === "sr" ? "success rate" : "progress (subgoals)", 0, 0); ctx.restore();

    const D = DATA[metric], nb = METHODS.length, groupW = plotW / TASKS.length;
    const barW = groupW * 0.15, gap = groupW * 0.03, totalW = nb * barW + (nb - 1) * gap;
    TASKS.forEach((task, gi) => {
      const gx = padL + groupW * gi, start = gx + (groupW - totalW) / 2;
      METHODS.forEach((m, mi) => {
        const raw = D.vals[gi][mi], frac = raw / D.den[gi];
        const x = start + mi * (barW + gap); let y = Y(frac), bh = padT + plotH - y;
        if (bh < 3) { bh = 3; y = padT + plotH - bh; }   // min stub so a 0/N bar stays visible
        ctx.fillStyle = m.col; ctx.beginPath(); ctx.roundRect(x, y, barW, bh, 3); ctx.fill();
        ctx.fillStyle = m.ours ? "#0a7d72" : "#69727f";
        ctx.font = (m.ours ? "700 " : "600 ") + "11px ui-monospace,monospace";
        ctx.textAlign = "center"; ctx.textBaseline = "bottom";
        ctx.fillText(raw + "/" + D.den[gi], x + barW / 2, y - 3);
      });
      ctx.fillStyle = "#111418"; ctx.font = "600 13px Inter,sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.fillText(task, gx + groupW / 2, padT + plotH + 10);
    });
  }
  if (!ctx.roundRect) ctx.roundRect = function (x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); this.moveTo(x + r, y); this.arcTo(x + w, y, x + w, y + h, r); this.arcTo(x + w, y + h, x, y + h, r); this.arcTo(x, y + h, x, y, r); this.arcTo(x, y, x + w, y, r); };

  document.querySelectorAll("#results-metric .segbtn").forEach(b =>
    b.addEventListener("click", () => {
      metric = b.dataset.m;
      document.querySelectorAll("#results-metric .segbtn").forEach(x => x.classList.toggle("active", x === b));
      draw();
    }));
  window.addEventListener("resize", resize); resize();
})();
