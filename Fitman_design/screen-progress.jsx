/* Fitman — Progress dashboards */
function ProgressScreen({ platform, t }) {
  const D = window.FITMAN_DATA;
  const isM = platform === 'mobile';
  const [lift, setLift] = React.useState('squat');
  const [range, setRange] = React.useState('12W');
  const L = D.strength[lift];
  const prIndex = L.series.indexOf(Math.max(...L.series));
  const bwNow = D.bodyweight[D.bodyweight.length - 1].v;
  const bwChange = +(bwNow - D.bodyweight[0].v).toFixed(1);

  const wrap = (children) => isM ? <div className="fm-grid">{children}</div> : children;

  const statRow = (
    <div className="fm-grid" style={{ gridTemplateColumns: isM ? '1fr 1fr' : 'repeat(4,1fr)' }}>
      <Stat icon="dumbbell" label="WORKOUTS" value={D.summary.totalWorkouts} delta="+4 this month" deltaDir="up" />
      <Stat icon="flame" label="STREAK" value={D.summary.streak} unit="days" delta="Best: 8" deltaDir="up" />
      <Stat icon="scale" label="BODY WEIGHT" value={bwNow} unit="kg" delta={`${bwChange} kg`} deltaDir={bwChange < 0 ? 'up' : 'down'} />
      <Stat icon="trophy" label="PRs (30d)" value={D.prs.length} delta="New bests" deltaDir="up" />
    </div>
  );

  const strengthCard = (
    <div className="fm-card fm-card-pad-lg">
      <CardHead title="Strength progression" sub={`Estimated 1-rep max · ${range}`}
        right={<Seg value={range} onChange={setRange} options={['4W', '12W', '1Y']} />} />
      <div className="fm-chiprow" style={{ marginBottom: 12 }}>
        {Object.keys(D.strength).map(k => <Chip key={k} active={lift === k} onClick={() => setLift(k)}>{D.strength[k].name}</Chip>)}
      </div>
      <LineChart data={L.series.map((v, i) => ({ label: D.weeks[i], v }))} height={isM ? 170 : 210} prIndex={prIndex} unit="kg" />
      <div className="fm-between" style={{ marginTop: 14, padding: '13px 15px', background: 'var(--accent-soft)', borderRadius: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div className="fm-pr-medal"><Icon name="trophy" size={18} /></div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--accent)' }}>New personal record</div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 600 }}>{L.name} · {L.pr.when}</div>
          </div>
        </div>
        <div className="fm-mono" style={{ fontSize: 24, color: 'var(--accent)' }}>{L.pr.val}<span style={{ fontSize: 13 }}>{L.unit}</span></div>
      </div>
    </div>
  );

  const volumeCard = (
    <div className="fm-card">
      <CardHead title="Training volume" sub="Total kg lifted per week" />
      <BarChart data={D.volume} height={isM ? 150 : 180} />
    </div>
  );

  const bwCard = (
    <div className="fm-card">
      <CardHead title="Body weight" sub={`Goal ${D.bwGoal} kg`} right={
        <div className="fm-mono" style={{ fontSize: 18 }}>{bwNow}<span style={{ fontSize: 12, color: 'var(--muted)' }}>kg</span></div>} />
      <LineChart data={D.bodyweight} height={isM ? 150 : 180} goal={D.bwGoal} unit="kg" color="var(--ink)" />
    </div>
  );

  const consistencyCard = (
    <div className="fm-card">
      <CardHead title="Consistency" sub="Last 17 weeks" right={
        <span className="fm-stat-delta fm-up" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="flame" size={15} />{D.summary.streak}-day streak</span>} />
      <Heatmap cells={D.heat} weeks={17} />
      <div className="fm-between" style={{ marginTop: 14 }}>
        <div className="fm-legend"><span>Less</span>
          {[0, 1, 2, 3, 4].map(i => <span key={i} className="fm-dot" style={{ background: ['var(--line)', 'rgba(255,90,54,0.28)', 'rgba(255,90,54,0.5)', 'rgba(255,90,54,0.74)', 'var(--accent)'][i] }} />)}
          <span>More</span></div>
      </div>
    </div>
  );

  const balanceCard = (
    <div className="fm-card">
      <CardHead title="Muscle balance" sub="Share of weekly volume" right={<Icon name="target" size={18} color="var(--muted)" />} />
      {t.balanceView === 'radar'
        ? <RadarChart data={D.balance} height={isM ? 230 : 250} />
        : <div style={{ marginTop: 4 }}>{D.balance.map(b => (
            <div className="fm-bal-row" key={b.name}>
              <div className="fm-bal-name">{b.name}</div>
              <div className="fm-bal-track"><i style={{ width: `${(b.pct / D.balance[0].pct) * 100}%`, background: D.MUSCLE_COLORS[b.name] }} /></div>
              <div className="fm-bal-val">{b.pct}%</div>
            </div>))}
          </div>}
    </div>
  );

  const prCard = (
    <div className="fm-card">
      <CardHead title="Personal records" sub="All-time bests" right={<Icon name="trophy" size={18} color="var(--accent)" />} />
      {D.prs.map((p, i) => (
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

  return (
    <>
      <Header platform={platform} title="Progress" sub="Your trends & records" />
      <div className="fm-screen">
        {statRow}
        {isM ? (
          <div className="fm-grid" style={{ marginTop: 16 }}>
            {strengthCard}{volumeCard}{bwCard}{consistencyCard}{balanceCard}{prCard}
          </div>
        ) : (
          <div className="fm-grid" style={{ marginTop: 16 }}>
            {strengthCard}
            <div className="fm-dash-grid cols2">{volumeCard}{bwCard}</div>
            <div className="fm-dash-grid cols2">{consistencyCard}{balanceCard}</div>
            {prCard}
          </div>
        )}
      </div>
    </>
  );
}
Object.assign(window, { ProgressScreen });
