/* Fitman — Workout history / log */
function HistoryScreen({ platform }) {
  const D = window.FITMAN_DATA;
  const isM = platform === 'mobile';
  const [filter, setFilter] = React.useState('all');
  const [open, setOpen] = React.useState(null);
  const list = D.history.filter(h => filter === 'all' ? true : filter === 'cardio' ? h.cardio : !h.cardio);
  const monthVol = D.history.reduce((a, h) => a + h.volume, 0);

  const card = (h) => (
    <div className="fm-hist" key={h.id} onClick={() => setOpen(open === h.id ? null : h.id)}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div className="fm-hist-date">
          <div className="fm-hist-dd fm-mono">{h.dd}</div>
          <div className="fm-hist-mo">{h.mo}</div>
        </div>
        <div style={{ flex: 1 }}>
          <div className="fm-hist-name">{h.name}</div>
          <div className="fm-hist-meta">
            <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center' }}><Icon name="clock" size={14} />{h.durationMin} min</span>
            {!h.cardio && <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center' }}><Icon name="bolt" size={14} />{fmt.vol(h.volume)} kg</span>}
            <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center' }}><Icon name="list" size={14} />{h.exercises.length} ex</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {h.muscles.map(m => <span className="fm-tag" key={m} style={{ color: muscleColor(m), background: 'color-mix(in srgb, ' + (D.MUSCLE_COLORS[m]) + ' 12%, transparent)' }}>{m}</span>)}
          <Icon name="chevron" size={16} color="var(--faint)" style={{ transform: open === h.id ? 'rotate(90deg)' : 'none', transition: 'transform .2s' }} />
        </div>
      </div>
      {open === h.id && (
        <div className="fm-hist-detail fm-fadein">
          {h.exercises.map((ex, i) => (
            <div className="fm-hist-exrow" key={i}>
              <span className="nm">{ex.name}</span>
              <span className="vv fm-mono">{ex.sets.map(s => s.label ? s.label : `${s.w || 'BW'}×${s.r}`).join('  ·  ')}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <Header platform={platform} title="History" sub={`${D.summary.totalWorkouts} workouts logged`}
        right={<div className="fm-seg"><button data-active={filter === 'all'} onClick={() => setFilter('all')}>All</button><button data-active={filter === 'strength'} onClick={() => setFilter('strength')}>Strength</button><button data-active={filter === 'cardio'} onClick={() => setFilter('cardio')}>Cardio</button></div>} />
      <div className="fm-screen">
        <div className="fm-grid" style={{ gridTemplateColumns: isM ? '1fr 1fr' : 'repeat(3,1fr)', marginBottom: 18 }}>
          <Stat icon="calendar" label="THIS MONTH" value={D.history.length} unit="sessions" />
          <Stat icon="bolt" label="MONTH VOLUME" value={fmt.vol(monthVol)} unit="kg" />
          <Stat icon="flame" label="STREAK" value={D.summary.streak} unit="days" />
        </div>
        <div className="fm-section-label" style={{ marginTop: 0 }}>June 2026</div>
        {isM ? list.map(card) : <div className="fm-dash-grid cols2">{list.map(card)}</div>}
      </div>
    </>
  );
}
Object.assign(window, { HistoryScreen });
