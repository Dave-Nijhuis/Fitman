/* Fitman — shared UI primitives & helpers */

const fmt = {
  vol: v => v >= 1000 ? (v / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : '' + v,
  clock: s => { const m = Math.floor(s / 60), ss = s % 60; return `${m}:${String(ss).padStart(2, '0')}`; },
  clockH: s => { const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
    return h ? `${h}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}` : `${m}:${String(ss).padStart(2, '0')}`; },
};

function Stat({ icon, label, value, unit, delta, deltaDir }) {
  return (
    <div className="fm-stat fm-fadein">
      <div className="fm-stat-ico"><Icon name={icon} size={15} sw={2} /><span>{label}</span></div>
      <div className="fm-stat-val fm-mono">{value}{unit && <span className="u">{unit}</span>}</div>
      {delta && <div className={`fm-stat-delta ${deltaDir === 'down' ? 'fm-down' : 'fm-up'}`}>{delta}</div>}
    </div>
  );
}

function Seg({ options, value, onChange }) {
  return (
    <div className="fm-seg">
      {options.map(o => (
        <button key={o.v ?? o} data-active={(o.v ?? o) === value} onClick={() => onChange(o.v ?? o)}>{o.label ?? o}</button>
      ))}
    </div>
  );
}

function Chip({ active, children, onClick }) {
  return <button className="fm-chip" data-active={!!active} onClick={onClick}>{children}</button>;
}

function ProgressBar({ pct }) {
  return <div className="fm-progress"><i style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} /></div>;
}

function muscleColor(m) { return (window.FITMAN_DATA.MUSCLE_COLORS[m]) || 'var(--accent)'; }

function CardHead({ title, sub, right }) {
  return (
    <div className="fm-card-head">
      <div>
        <div className="fm-card-title">{title}</div>
        {sub && <div className="fm-card-sub">{sub}</div>}
      </div>
      {right}
    </div>
  );
}

Object.assign(window, { fmt, Stat, Seg, Chip, ProgressBar, muscleColor, CardHead });
