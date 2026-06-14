/* Fitman — chart components (hand-built SVG). Exports: useMeasure, LineChart, BarChart, Heatmap, RadarChart */

function useMeasure() {
  const ref = React.useRef(null);
  const [w, setW] = React.useState(320);
  React.useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver((entries) => {
      const cw = entries[0].contentRect.width;
      if (cw > 0) setW(cw);
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

// smooth path through points (mild cardinal smoothing)
function smoothPath(pts) {
  if (pts.length < 2) return '';
  let d = `M ${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const t = 0.18;
    const c1x = p1[0] + (p2[0] - p0[0]) * t, c1y = p1[1] + (p2[1] - p0[1]) * t;
    const c2x = p2[0] - (p3[0] - p1[0]) * t, c2y = p2[1] - (p3[1] - p1[1]) * t;
    d += ` C ${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
  }
  return d;
}

function LineChart({ data, height = 168, color = 'var(--accent)', goal, unit = '', prIndex = -1, smooth = true }) {
  const [ref, W] = useMeasure();
  const padL = 30, padR = 12, padT = 14, padB = 22;
  const vals = data.map(d => d.v);
  let min = Math.min(...vals, goal != null ? goal : Infinity);
  let max = Math.max(...vals, goal != null ? goal : -Infinity);
  const span = (max - min) || 1; min -= span * 0.18; max += span * 0.18;
  const iw = Math.max(W - padL - padR, 10), ih = height - padT - padB;
  const x = i => padL + (data.length === 1 ? iw / 2 : (i / (data.length - 1)) * iw);
  const y = v => padT + ih - ((v - min) / (max - min)) * ih;
  const pts = data.map((d, i) => [x(i), y(d.v)]);
  const line = smooth ? smoothPath(pts) : 'M ' + pts.map(p => p.join(',')).join(' L ');
  const area = line + ` L ${x(data.length - 1)},${padT + ih} L ${x(0)},${padT + ih} Z`;
  const gid = 'g' + Math.round(min * 1000) + data.length;
  const ticks = 3;
  return (
    <div ref={ref} style={{ width: '100%' }}>
      <svg width={W} height={height} style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity="0.16" />
            <stop offset="1" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {Array.from({ length: ticks + 1 }).map((_, i) => {
          const gv = min + (i / ticks) * (max - min); const gy = y(gv);
          return (<g key={i}>
            <line x1={padL} y1={gy} x2={W - padR} y2={gy} stroke="var(--line)" strokeWidth="1" />
            <text x={padL - 7} y={gy + 3.5} textAnchor="end" fontSize="9.5" fontFamily="DM Mono, monospace" fill="var(--faint)">{Math.round(gv)}</text>
          </g>);
        })}
        {goal != null && (<g>
          <line x1={padL} y1={y(goal)} x2={W - padR} y2={y(goal)} stroke="var(--accent)" strokeWidth="1.4" strokeDasharray="4 4" opacity="0.7" />
          <text x={W - padR} y={y(goal) - 5} textAnchor="end" fontSize="9.5" fontWeight="700" fill="var(--accent)">GOAL {goal}{unit}</text>
        </g>)}
        <path d={area} fill={`url(#${gid})`} />
        <path d={line} fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((pt, i) => (
          <g key={i}>
            {i === prIndex && <circle cx={pt[0]} cy={pt[1]} r="9" fill={color} opacity="0.16" />}
            <circle cx={pt[0]} cy={pt[1]} r={i === pts.length - 1 || i === prIndex ? 4.2 : 0}
              fill={i === prIndex ? color : 'var(--card)'} stroke={color} strokeWidth="2.4" />
          </g>
        ))}
        {data.map((d, i) => (i % Math.ceil(data.length / 6) === 0 || i === data.length - 1) && (
          <text key={i} x={x(i)} y={height - 6} textAnchor="middle" fontSize="9.5" fontFamily="DM Mono, monospace" fill="var(--faint)">{d.label}</text>
        ))}
      </svg>
    </div>
  );
}

function BarChart({ data, height = 168, color = 'var(--accent)', highlightLast = true, unit = '' }) {
  const [ref, W] = useMeasure();
  const padL = 8, padR = 8, padT = 16, padB = 22;
  const max = Math.max(...data.map(d => d.v)) * 1.08 || 1;
  const iw = Math.max(W - padL - padR, 10), ih = height - padT - padB;
  const gap = Math.min(10, iw / data.length * 0.32);
  const bw = (iw - gap * (data.length - 1)) / data.length;
  return (
    <div ref={ref} style={{ width: '100%' }}>
      <svg width={W} height={height} style={{ display: 'block' }}>
        {data.map((d, i) => {
          const bh = Math.max((d.v / max) * ih, 2);
          const bx = padL + i * (bw + gap), by = padT + ih - bh;
          const hl = highlightLast && i === data.length - 1;
          return (<g key={i}>
            <rect x={bx} y={by} width={bw} height={bh} rx={Math.min(bw / 2.6, 6)}
              fill={hl ? color : 'var(--line-strong)'} opacity={hl ? 1 : 0.85} />
            {(i % Math.ceil(data.length / 6) === 0 || i === data.length - 1) &&
              <text x={bx + bw / 2} y={height - 6} textAnchor="middle" fontSize="9.5" fontFamily="DM Mono, monospace" fill="var(--faint)">{d.label}</text>}
          </g>);
        })}
      </svg>
    </div>
  );
}

function Heatmap({ cells, weeks = 17 }) {
  // cells: array of intensity 0..4, length weeks*7 (column-major weeks)
  const shade = ['var(--line)', 'rgba(255,90,54,0.28)', 'rgba(255,90,54,0.5)', 'rgba(255,90,54,0.74)', 'var(--accent)'];
  return (
    <div className="fm-heat" style={{ gridTemplateColumns: `repeat(${weeks}, 1fr)` }}>
      {cells.map((c, i) => <i key={i} style={{ background: shade[c] }} title={c ? 'Trained' : 'Rest'} />)}
    </div>
  );
}

function RadarChart({ data, height = 220, color = 'var(--accent)' }) {
  // data: [{name, pct}] — pct relative; normalise to max
  const [ref, W] = useMeasure();
  const cx = W / 2, cy = height / 2 + 4, R = Math.min(W, height) / 2 - 30;
  const max = Math.max(...data.map(d => d.pct)) * 1.1 || 1;
  const n = data.length;
  const ang = i => -Math.PI / 2 + (i / n) * Math.PI * 2;
  const pt = (i, r) => [cx + Math.cos(ang(i)) * r, cy + Math.sin(ang(i)) * r];
  const ring = (f) => data.map((_, i) => pt(i, R * f).join(',')).join(' ');
  const poly = data.map((d, i) => pt(i, R * (d.pct / max)).join(',')).join(' ');
  return (
    <div ref={ref} style={{ width: '100%' }}>
      <svg width={W} height={height} style={{ display: 'block', overflow: 'visible' }}>
        {[0.25, 0.5, 0.75, 1].map((f, i) => <polygon key={i} points={ring(f)} fill="none" stroke="var(--line)" strokeWidth="1" />)}
        {data.map((_, i) => { const [ex, ey] = pt(i, R); return <line key={i} x1={cx} y1={cy} x2={ex} y2={ey} stroke="var(--line)" strokeWidth="1" />; })}
        <polygon points={poly} fill={color} fillOpacity="0.16" stroke={color} strokeWidth="2.2" strokeLinejoin="round" />
        {data.map((d, i) => { const [px, py] = pt(i, R * (d.pct / max)); return <circle key={i} cx={px} cy={py} r="3.4" fill={color} />; })}
        {data.map((d, i) => {
          const [lx, ly] = pt(i, R + 16);
          return <text key={i} x={lx} y={ly + 3} textAnchor={Math.abs(lx - cx) < 8 ? 'middle' : lx > cx ? 'start' : 'end'}
            fontSize="11" fontWeight="700" fill="var(--muted)">{d.name}</text>;
        })}
      </svg>
    </div>
  );
}

Object.assign(window, { useMeasure, LineChart, BarChart, Heatmap, RadarChart });
