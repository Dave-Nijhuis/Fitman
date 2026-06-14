/* Fitman — Active workout logging (the fast in-gym hero flow) */
function ActiveScreen({ platform, workout, setWorkout, onStart, onFinish, t }) {
  const isM = platform === 'mobile';
  const [elapsed, setElapsed] = React.useState(0);
  const [rest, setRest] = React.useState(0);

  React.useEffect(() => {
    if (!workout) return;
    const tick = () => setElapsed(Math.floor((Date.now() - workout.startedAt) / 1000));
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, [workout && workout.startedAt]);

  React.useEffect(() => {
    if (rest <= 0) return;
    const id = setInterval(() => setRest(r => (r <= 1 ? 0 : r - 1)), 1000);
    return () => clearInterval(id);
  }, [rest > 0]);

  if (!workout) {
    return (
      <>
        <Header platform={platform} title="Workout" sub="Nothing in progress" />
        <div className="fm-screen">
          <div className="fm-card" style={{ textAlign: 'center', padding: 30 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Icon name="dumbbell" size={28} />
            </div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>Ready when you are</div>
            <div style={{ color: 'var(--muted)', fontWeight: 600, fontSize: 14, margin: '6px 0 18px' }}>Start today's session and log sets as you go.</div>
            <button className="fm-btn fm-btn-accent fm-btn-block fm-btn-lg" onClick={onStart}>
              <Icon name="play" size={19} sw={2.2} /> Start {window.FITMAN_DATA.todayPlan.name}
            </button>
          </div>
        </div>
      </>
    );
  }

  const exs = workout.exercises;
  const totalSets = exs.reduce((a, e) => a + e.sets.length, 0);
  const doneSets = exs.reduce((a, e) => a + e.sets.filter(s => s.done).length, 0);
  const volume = exs.reduce((a, e) => a + e.sets.filter(s => s.done).reduce((x, s) => x + (s.w || 0) * (s.r || 0), 0), 0);

  const update = (fn) => setWorkout(w => { const nx = JSON.parse(JSON.stringify(w)); fn(nx); return nx; });
  const setVal = (ei, si, key, v) => update(w => { w.exercises[ei].sets[si][key] = v; });
  const bump = (ei, si, key, d) => update(w => { const s = w.exercises[ei].sets[si]; s[key] = Math.max(0, +(s[key] + d).toFixed(2)); });
  const toggle = (ei, si) => {
    update(w => { const s = w.exercises[ei].sets[si]; s.done = !s.done; });
    const nowDone = !exs[ei].sets[si].done;
    if (nowDone) setRest(90);
  };
  const addSet = (ei) => update(w => { const sets = w.exercises[ei].sets; const last = sets[sets.length - 1] || { w: 0, r: 8 }; sets.push({ w: last.w, r: last.r, prev: null, done: false }); });

  const numField = (ei, si, key, step) => {
    const v = exs[ei].sets[si][key];
    const onType = (raw) => { if (raw === '') { setVal(ei, si, key, 0); return; } const n = parseFloat(raw); if (!isNaN(n)) setVal(ei, si, key, n); };
    if (t.logControl === 'direct') {
      return <input className="fm-direct" type="text" inputMode="decimal" value={v}
        onChange={e => onType(e.target.value)} onFocus={e => e.target.select()} />;
    }
    return (
      <div className="fm-stepper">
        <button onClick={() => bump(ei, si, key, -step)} aria-label="decrease">–</button>
        <input type="text" inputMode="decimal" value={v} onChange={e => onType(e.target.value)} onFocus={e => e.target.select()} />
        <button onClick={() => bump(ei, si, key, step)} aria-label="increase">+</button>
      </div>
    );
  };

  return (
    <>
      <div className="fm-active-bar">
        <div className="fm-between">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: 'rgba(255,255,255,.55)', letterSpacing: '.04em', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{workout.focus}</div>
            <div className="fm-timer fm-mono">{fmt.clockH(elapsed)}</div>
            <div className="fm-active-sub">{workout.name} · {fmt.vol(volume)} kg · {doneSets}/{totalSets} sets</div>
          </div>
          <button className="fm-btn" style={{ background: '#fff', color: 'var(--ink)', padding: '11px 18px', flexShrink: 0, marginLeft: 12 }} onClick={onFinish}>Finish</button>
        </div>
        <div className="fm-progress" style={{ marginTop: 14, background: 'rgba(255,255,255,.18)' }}>
          <i style={{ width: `${totalSets ? (doneSets / totalSets) * 100 : 0}%`, background: '#fff' }} />
        </div>
      </div>

      <div className="fm-screen" style={{ paddingTop: 14 }}>
        {rest > 0 && (
          <div className="fm-rest fm-fadein">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icon name="timer" size={20} sw={2} />
              <div>
                <div style={{ fontWeight: 800, fontSize: 15 }} className="fm-mono">{fmt.clock(rest)}</div>
                <div style={{ fontSize: 11.5, fontWeight: 600, opacity: .85, whiteSpace: 'nowrap' }}>Rest timer</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="fm-btn" style={{ background: 'rgba(255,255,255,.22)', color: '#fff', padding: '8px 12px', fontSize: 13 }} onClick={() => setRest(r => r + 15)}>+15s</button>
              <button className="fm-btn" style={{ background: '#fff', color: 'var(--accent)', padding: '8px 14px', fontSize: 13 }} onClick={() => setRest(0)}>Skip</button>
            </div>
          </div>
        )}

        <div style={isM ? {} : { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
          {exs.map((ex, ei) => {
            const cd = ex.sets.filter(s => s.done).length;
            return (
              <div className="fm-ex-card" key={ei}>
                <div className="fm-ex-head">
                  <div className="fm-ex-thumb"><Icon name="dumbbell" size={20} /></div>
                  <div style={{ flex: 1 }}>
                    <div className="fm-ex-name">{ex.name}</div>
                    <div className="fm-ex-tag">{ex.muscle} · {ex.equip}</div>
                  </div>
                  <div className="fm-mono" style={{ fontSize: 12.5, color: cd === ex.sets.length ? 'var(--good)' : 'var(--muted)', fontWeight: 600 }}>{cd}/{ex.sets.length}</div>
                </div>
                <div className="fm-set-head">
                  <span>SET</span><span style={{ textAlign: 'center' }}>PREV</span><span style={{ textAlign: 'center' }}>KG</span><span style={{ textAlign: 'center' }}>REPS</span><span></span>
                </div>
                {ex.sets.map((s, si) => (
                  <div className="fm-set-row" data-done={!!s.done} key={si}>
                    <div className="c0"><div className="fm-set-num fm-mono">{s.done ? <Icon name="check" size={15} sw={2.6} color="#fff" /> : si + 1}</div></div>
                    <div className="fm-prev fm-mono">{s.prev ? `${s.prev.w || '–'}×${s.prev.r}` : '–'}</div>
                    {numField(ei, si, 'w', 2.5)}
                    {numField(ei, si, 'r', 1)}
                    <button className="fm-check" data-done={!!s.done} onClick={() => toggle(ei, si)} aria-label="complete set">
                      <Icon name="check" size={19} sw={2.6} color={s.done ? '#fff' : 'var(--line-strong)'} />
                    </button>
                  </div>
                ))}
                <button className="fm-addset" onClick={() => addSet(ei)}><Icon name="plus" size={15} sw={2.2} /> Add set</button>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
          <button className="fm-btn fm-btn-accent fm-btn-block fm-btn-lg" onClick={onFinish}>
            <Icon name="check" size={19} sw={2.4} /> Finish workout
          </button>
        </div>
      </div>
    </>
  );
}
Object.assign(window, { ActiveScreen });
