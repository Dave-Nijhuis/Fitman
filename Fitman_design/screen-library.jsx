/* Fitman — Exercise library */
function LibraryScreen({ platform }) {
  const D = window.FITMAN_DATA;
  const isM = platform === 'mobile';
  const [q, setQ] = React.useState('');
  const [type, setType] = React.useState('all');
  const types = [{ v: 'all', label: 'All' }, { v: 'weight', label: 'Weights' }, { v: 'bodyweight', label: 'Bodyweight' }, { v: 'cardio', label: 'Cardio' }];

  const filtered = D.exercises.filter(e =>
    (type === 'all' || e.type === type) &&
    (q === '' || e.name.toLowerCase().includes(q.toLowerCase()) || e.muscle.toLowerCase().includes(q.toLowerCase())));

  const groups = {};
  filtered.forEach(e => { (groups[e.muscle] = groups[e.muscle] || []).push(e); });
  const order = D.muscleOrder.filter(m => groups[m]);

  const row = (e) => (
    <div className="fm-lib-row" key={e.id}>
      <div className="fm-lib-ico" style={{ background: 'color-mix(in srgb, ' + D.MUSCLE_COLORS[e.muscle] + ' 13%, transparent)', color: D.MUSCLE_COLORS[e.muscle] }}>
        <Icon name={e.type === 'cardio' ? 'route' : e.type === 'bodyweight' ? 'bolt' : 'dumbbell'} size={20} />
      </div>
      <div style={{ flex: 1 }}>
        <div className="fm-lib-name">{e.name}</div>
        <div className="fm-lib-meta">{e.equip} · {e.type === 'weight' ? 'Weighted' : e.type === 'cardio' ? 'Cardio' : 'Bodyweight'}</div>
      </div>
      <Icon name="chevron" size={16} color="var(--faint)" />
    </div>
  );

  return (
    <>
      <Header platform={platform} title="Exercises" sub={`${D.exercises.length} in your library`} />
      <div className="fm-screen">
        <div className="fm-search">
          <Icon name="search" size={19} color="var(--faint)" />
          <input placeholder="Search exercises or muscles" value={q} onChange={e => setQ(e.target.value)} />
          {q && <button onClick={() => setQ('')}><Icon name="x" size={17} color="var(--faint)" /></button>}
        </div>
        <div className="fm-chiprow" style={{ marginTop: 12 }}>
          {types.map(tp => <Chip key={tp.v} active={type === tp.v} onClick={() => setType(tp.v)}>{tp.label}</Chip>)}
        </div>

        {order.length === 0 && <div className="fm-empty">No exercises match “{q}”.</div>}
        <div style={isM ? {} : { columns: 2, columnGap: 32, marginTop: 6 }}>
          {order.map(m => (
            <div key={m} style={{ breakInside: 'avoid', marginBottom: 8 }}>
              <div className="fm-muscle-h" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="fm-dot" style={{ background: D.MUSCLE_COLORS[m], width: 8, height: 8, borderRadius: 3 }} /> {m}
                <span style={{ color: 'var(--faint)' }}>· {groups[m].length}</span>
              </div>
              {groups[m].map(row)}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
Object.assign(window, { LibraryScreen });
