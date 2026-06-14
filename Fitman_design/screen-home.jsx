/* Fitman — Home / Today screen */
function HomeScreen({ platform, onStart, go }) {
  const D = window.FITMAN_DATA;
  const s = D.summary;
  const isM = platform === 'mobile';
  const planItems = D.todayPlan.items.map(it => ({ ...D.exById[it.exId], sets: it.sets.length }));

  const statRow = (
    <div className="fm-grid" style={{ gridTemplateColumns: isM ? '1fr 1fr' : 'repeat(4,1fr)', marginTop: 4 }}>
      <Stat icon="flame" label="STREAK" value={s.streak} unit="days" delta="Personal best" deltaDir="up" />
      <Stat icon="dumbbell" label="THIS WEEK" value={s.weekWorkouts} unit="/ 5" delta="On track" deltaDir="up" />
      <Stat icon="bolt" label="VOLUME" value={fmt.vol(s.weekVolume)} unit="kg" delta="+12% vs last" deltaDir="up" />
      <Stat icon="clock" label="TIME" value={Math.round(s.weekMinutes / 60 * 10) / 10} unit="h" delta={`${s.weekMinutes} min`} />
    </div>
  );

  const hero = (
    <div className="fm-hero fm-fadein">
      <div className="fm-hero-top">
        <div className="fm-hero-eyebrow">Today · Day 142</div>
        <div className="fm-hero-name">{D.todayPlan.name}</div>
        <div className="fm-hero-meta">
          <span>{D.todayPlan.focus}</span>
          <span>· {D.todayPlan.items.length} exercises</span>
          <span>· ~{D.todayPlan.estMin} min</span>
        </div>
        <button className="fm-btn fm-btn-accent fm-btn-block fm-btn-lg" style={{ marginTop: 16 }} onClick={onStart}>
          <Icon name="play" size={19} sw={2.2} /> Start workout
        </button>
      </div>
      {planItems.slice(0, isM ? 4 : 6).map((ex, i) => (
        <div className="fm-hero-ex" key={i}>
          <span className="n fm-mono">{i + 1}</span>
          <span className="nm">{ex.name}</span>
          <span className="sx fm-mono">{ex.sets} × {ex.muscle}</span>
        </div>
      ))}
    </div>
  );

  const weekChart = (
    <div className="fm-card">
      <CardHead title="Weekly volume" sub="Last 10 weeks · kg lifted" right={
        <button className="fm-btn fm-btn-soft" style={{ padding: '6px 12px', fontSize: 12.5 }} onClick={() => go('progress')}>Details</button>} />
      <BarChart data={D.volume} height={isM ? 140 : 170} />
    </div>
  );

  const prs = (
    <div className="fm-card">
      <CardHead title="Recent records" sub="Personal bests" right={<Icon name="trophy" size={18} color="var(--accent)" />} />
      {D.prs.slice(0, 3).map((p, i) => (
        <div className="fm-pr-row" key={i}>
          <div className="fm-pr-medal"><Icon name="trophy" size={18} /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{p.lift}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>{p.when}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="fm-mono" style={{ fontSize: 17 }}>{p.val}<span style={{ fontSize: 11, color: 'var(--muted)' }}>{p.unit}</span></div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--good)' }}>{p.delta}</div>
          </div>
        </div>
      ))}
    </div>
  );

  const recent = (
    <div className="fm-card">
      <CardHead title="Recent activity" right={
        <button className="fm-btn fm-btn-soft" style={{ padding: '6px 12px', fontSize: 12.5 }} onClick={() => go('history')}>All</button>} />
      {D.history.slice(0, 3).map(h => (
        <div key={h.id} className="fm-between" style={{ padding: '9px 0', borderTop: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
              <Icon name={h.cardio ? 'route' : 'dumbbell'} size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{h.name}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>{h.mo} {h.dd} · {h.durationMin} min</div>
            </div>
          </div>
          <div className="fm-mono" style={{ fontSize: 13, color: 'var(--muted)' }}>{h.cardio ? '—' : fmt.vol(h.volume) + 'kg'}</div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <div className="fm-topbar">
        <div className="fm-topbar-row">
          <div>
            <div className="fm-greet-sm">Good morning</div>
            <h1 className="fm-title">Alex Rivera</h1>
          </div>
          <div className="fm-avatar">AR</div>
        </div>
      </div>
      <div className="fm-screen">
        {statRow}
        {isM ? (
          <div className="fm-grid" style={{ marginTop: 16 }}>
            {hero}{weekChart}{prs}{recent}
          </div>
        ) : (
          <>
            <div style={{ height: 16 }} />
            <div className="fm-dash-grid cols2">
              <div className="fm-grid">{hero}{recent}</div>
              <div className="fm-grid">{weekChart}{prs}</div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
Object.assign(window, { HomeScreen });
