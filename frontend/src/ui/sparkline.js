// sparkline.js: draws a 7-day trend line as inline SVG, with the baseline band behind it.
const W = 104;
const H = 30;
const PAD = 3;

function scale(values, extra) {
  const all = values.concat(extra).filter((v) => typeof v === 'number');
  const min = Math.min(...all);
  const max = Math.max(...all);
  const span = max - min || 1;
  return (v) => H - PAD - ((v - min) / span) * (H - PAD * 2);
}

function linePath(values, y) {
  const step = (W - PAD * 2) / (values.length - 1);
  let path = '';
  let pen = false;
  values.forEach((v, i) => {
    if (typeof v !== 'number') { pen = false; return; }
    path += `${pen ? 'L' : 'M'}${(PAD + i * step).toFixed(1)} ${y(v).toFixed(1)}`;
    pen = true;
  });
  return path;
}

export function renderSparkline(values, mean, sd) {
  const hasBase = typeof mean === 'number' && typeof sd === 'number';
  const y = scale(values, hasBase ? [mean - sd, mean + sd] : []);
  const band = hasBase
    ? `<rect class="band" x="0" y="${y(mean + sd).toFixed(1)}" width="${W}" height="${(y(mean - sd) - y(mean + sd)).toFixed(1)}"/>
       <line class="mean" x1="0" x2="${W}" y1="${y(mean).toFixed(1)}" y2="${y(mean).toFixed(1)}"/>`
    : '';
  const last = values[values.length - 1];
  const dot = typeof last === 'number' ? `<path class="dot" d="M${W - PAD} ${y(last).toFixed(1)}h0"/>` : '';
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Trend over 7 days with baseline band">
    ${band}<path class="line" d="${linePath(values, y)}"/>${dot}</svg>`;
}
