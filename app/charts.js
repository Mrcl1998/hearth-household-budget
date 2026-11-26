// Hearth Budget — charts: a spending donut and a monthly income-vs-spent bar
// chart, drawn on canvas with no library and no network.

function setupCanvas(canvas, cssHeight) {
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth;
  const height = cssHeight;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return { ctx, width, height };
}

export function drawDonut(canvas, slices) {
  const { ctx, width, height } = setupCanvas(canvas, 220);
  const cx = width / 2;
  const cy = height / 2;
  const outer = Math.min(width, height) / 2 - 8;
  const inner = outer * 0.62;
  const total = slices.reduce((s, x) => s + x.value, 0);
  ctx.clearRect(0, 0, width, height);
  if (total <= 0) {
    ctx.beginPath();
    ctx.arc(cx, cy, outer, 0, Math.PI * 2);
    ctx.fillStyle = '#ece5d3';
    ctx.fill();
  } else {
    let angle = -Math.PI / 2;
    for (const slice of slices) {
      const sweep = (slice.value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, outer, angle, angle + sweep);
      ctx.closePath();
      ctx.fillStyle = slice.color;
      ctx.fill();
      angle += sweep;
    }
  }
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(cx, cy, inner, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#22302a';
  const label = slices.totalLabel ?? '';
  ctx.font = `800 ${label.length > 10 ? 17 : 21}px "Segoe UI", system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, cx, cy - 9);
  ctx.fillStyle = '#6b756e';
  ctx.font = '12px "Segoe UI", system-ui, sans-serif';
  ctx.fillText(slices.totalSub ?? '', cx, cy + 13);
}

export function drawMonthBars(canvas, months) {
  const { ctx, width, height } = setupCanvas(canvas, 240);
  ctx.clearRect(0, 0, width, height);
  const padL = 8;
  const padR = 8;
  const padTop = 18;
  const padBottom = 26;
  const max = Math.max(1, ...months.flatMap((m) => [m.income, m.spent]));
  const slot = (width - padL - padR) / months.length;
  const barW = Math.min(26, slot * 0.28);
  ctx.font = '11px "Segoe UI", system-ui, sans-serif';
  ctx.textAlign = 'center';
  months.forEach((m, i) => {
    const x0 = padL + slot * i + slot / 2;
    const hIn = ((height - padTop - padBottom) * m.income) / max;
    const hSp = ((height - padTop - padBottom) * m.spent) / max;
    ctx.fillStyle = '#1f5138';
    ctx.fillRect(x0 - barW - 3, height - padBottom - hIn, barW, hIn);
    ctx.fillStyle = '#c96f3f';
    ctx.fillRect(x0 + 3, height - padBottom - hSp, barW, hSp);
    ctx.fillStyle = '#22302a';
    ctx.fillText(m.label, x0, height - 8);
  });
  ctx.textAlign = 'left';
  ctx.fillStyle = '#1f5138';
  ctx.fillRect(padL, 0, 12, 12);
  ctx.fillStyle = '#22302a';
  ctx.fillText('Pemasukan', padL + 17, 10);
  ctx.fillStyle = '#c96f3f';
  ctx.fillRect(padL + 108, 0, 12, 12);
  ctx.fillStyle = '#22302a';
  ctx.fillText('Pengeluaran', padL + 125, 10);
}
