/* piR2 — sim delay explorer, multi-task.
   Slider over unit delay d0 -> live success-rate plot per task. Tabs switch tasks.
   Leap Cube Reorient uses the real paper_corl FAIR numbers (multi_success_rate);
   the extra tasks are PLACEHOLDERS -- drop in real eval numbers when ready. */
(function () {
  "use strict";
  const XS = ["1", "2", "3"];
  const mk = (naive, rtc, ona, ours) => ([
    { key: "naive",   label: "Flow, naive async",    color: "#7f8b9c",               y: { 1: naive[0], 2: naive[1], 3: naive[2] } },
    { key: "rtc",     label: "Flow, Train-Time RTC", color: "#e0568f",               y: { 1: rtc[0],   2: rtc[1],   3: rtc[2] } },
    { key: "ours_na", label: "πR² (w/o async)",      color: "#5bb3a6",               y: { 1: ona[0],   2: ona[1],   3: ona[2] } },
    { key: "ours",    label: "πR² (full)",           color: "#0e9e8f", ours: true,   y: { 1: ours[0],  2: ours[1],  3: ours[2] } },
  ]);
  const TASKS = [
    { key: "leap", label: "Leap Cube Reorientation", yMax: 0.5, placeholder: false,
      note: "Leap Cube Reorientation · multi-success rate. πR² wins by cutting the effective delay (fewer denoising steps + asynchronous vision and language).",
      series: mk([0.16, 0.24, 0.21], [0.36, 0.25, 0.18], [0.37, 0.28, 0.25], [0.33, 0.38, 0.32]) },
    { key: "t2", label: "Sim Task 2", yMax: 1.0, placeholder: true,
      note: "Sim Task 2 · placeholder numbers, replace with eval results.",
      series: mk([0.30, 0.22, 0.16], [0.45, 0.34, 0.24], [0.55, 0.46, 0.38], [0.58, 0.55, 0.50]) },
    { key: "t3", label: "Sim Task 3", yMax: 1.0, placeholder: true,
      note: "Sim Task 3 · placeholder numbers, replace with eval results.",
      series: mk([0.20, 0.15, 0.10], [0.35, 0.26, 0.18], [0.44, 0.38, 0.30], [0.50, 0.48, 0.44]) },
  ];

  const canvas = document.getElementById("delay-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const slider = document.getElementById("delay-x");
  const dlabel = document.getElementById("delay-x-val");
  const tabsEl = document.getElementById("delay-tabs");
  const noteEl = document.getElementById("delay-note");

  let ti = 0, idx = 1;
  const task = () => TASKS[ti];

  function setTask(i) {
    ti = i;
    if (tabsEl) tabsEl.querySelectorAll(".tab").forEach((b, k) => b.classList.toggle("active", k === i));
    if (noteEl) noteEl.innerHTML = (task().placeholder ? "<b style='color:#c2452f'>[placeholder]</b> " : "") + task().note;
    draw();
  }

  function resize() {
    const w = canvas.parentElement.clientWidth, h = 300, dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr; canvas.height = h * dpr; canvas.style.width = w + "px"; canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); draw();
  }

  function draw() {
    const W = canvas.clientWidth, H = canvas.clientHeight, T = task(), yMax = T.yMax;
    ctx.clearRect(0, 0, W, H);
    const padL = 56, padR = 16, padT = 16, padB = 36, plotW = W - padL - padR, plotH = H - padT - padB;
    const X = i => padL + plotW * (i / (XS.length - 1));
    const Y = v => padT + plotH * (1 - v / yMax);

    ctx.strokeStyle = "#e9ecf1"; ctx.fillStyle = "#69727f";
    ctx.font = "11px ui-monospace,monospace"; ctx.textAlign = "right"; ctx.textBaseline = "middle";
    for (let t = 0; t <= 2; t++) { const g = yMax * t / 2, y = Y(g); ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(W - padR, y); ctx.stroke(); ctx.fillText(g.toFixed(2), padL - 8, y); }
    ctx.textAlign = "center"; ctx.textBaseline = "top";
    XS.forEach((lab, i) => ctx.fillText("d₀=" + lab, X(i), H - padB + 8));

    ctx.strokeStyle = "#cfd6df"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(idx), padT); ctx.lineTo(X(idx), padT + plotH); ctx.stroke();

    T.series.forEach(s => {
      ctx.strokeStyle = s.color; ctx.lineWidth = s.ours ? 3 : 2; ctx.globalAlpha = s.ours ? 1 : 0.85;
      ctx.beginPath(); XS.forEach((k, i) => { const x = X(i), y = Y(s.y[k]); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke();
      XS.forEach((k, i) => {
        const x = X(i), y = Y(s.y[k]);
        ctx.beginPath(); ctx.arc(x, y, i === idx ? (s.ours ? 6 : 5) : 3.5, 0, 7); ctx.fillStyle = s.color; ctx.fill();
      });
      ctx.globalAlpha = 1;
    });
    ctx.save(); ctx.translate(12, padT + plotH / 2); ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = "#5d6b7d"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = "11px ui-monospace,monospace"; ctx.fillText("success rate", 0, 0); ctx.restore();
  }

  if (tabsEl) TASKS.forEach((t, i) => { const b = document.createElement("button"); b.className = "tab" + (i === 0 ? " active" : ""); b.textContent = t.label; b.addEventListener("click", () => setTask(i)); tabsEl.appendChild(b); });
  if (slider) { slider.min = 0; slider.max = XS.length - 1; slider.step = 1; slider.value = idx; slider.addEventListener("input", () => { idx = +slider.value; if (dlabel) dlabel.textContent = XS[idx]; draw(); }); }
  setTask(0);
  window.addEventListener("resize", resize); resize();
})();
