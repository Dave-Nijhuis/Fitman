/* Fitman — app shell: Header + responsive App (nav + routing + workout state) */

function Header({ platform, title, sub, right }) {
  return (
    <div className="fm-topbar">
      <div className="fm-topbar-row">
        <div>
          <h1 className="fm-title">{title}</h1>
          {sub && <div className="fm-card-sub" style={{ marginTop: 3 }}>{sub}</div>}
        </div>
        {right}
      </div>
    </div>
  );
}

function makeWorkout() {
  const D = window.FITMAN_DATA, p = D.todayPlan;
  return {
    name: p.name, focus: p.focus, startedAt: Date.now(),
    exercises: p.items.map(it => {
      const ex = D.exById[it.exId];
      return {
        exId: it.exId, name: ex.name, muscle: ex.muscle, equip: ex.equip,
        sets: it.sets.map(s => ({ w: s.w, r: s.r, prev: { w: s.w, r: s.r }, done: false })),
      };
    }),
  };
}

const NAV = [
  { id: 'home', icon: 'home', label: 'Home' },
  { id: 'progress', icon: 'chart', label: 'Progress' },
  { id: 'history', icon: 'history', label: 'History' },
  { id: 'library', icon: 'library', label: 'Library' },
];

function App({ platform, t }) {
  const isM = platform === 'mobile';
  const key = 'fitman_tab_' + platform;
  const [tab, setTabRaw] = React.useState(() => {
    try { return localStorage.getItem(key) || 'home'; } catch (e) { return 'home'; }
  });
  const [workout, setWorkout] = React.useState(null);
  const scrollRef = React.useRef(null);

  const setTab = (id) => {
    setTabRaw(id);
    try { localStorage.setItem(key, id); } catch (e) {}
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  };
  const start = () => { setWorkout(makeWorkout()); setTab('active'); };
  const finish = () => { setWorkout(null); setTab('home'); };
  const onFab = () => { if (!workout) setWorkout(makeWorkout()); setTab('active'); };

  let screen;
  if (tab === 'home') screen = <HomeScreen platform={platform} onStart={start} go={setTab} />;
  else if (tab === 'active') screen = <ActiveScreen platform={platform} workout={workout} setWorkout={setWorkout} onStart={start} onFinish={finish} t={t} />;
  else if (tab === 'history') screen = <HistoryScreen platform={platform} />;
  else if (tab === 'library') screen = <LibraryScreen platform={platform} />;
  else if (tab === 'progress') screen = <ProgressScreen platform={platform} t={t} />;

  const accentVars = { '--accent': t.accent };

  if (isM) {
    const tab1 = NAV.slice(0, 2), tab2 = NAV.slice(2);
    const navBtn = (n) => (
      <button key={n.id} className="fm-tab" data-active={tab === n.id} onClick={() => setTab(n.id)}>
        <Icon name={n.icon} size={23} sw={tab === n.id ? 2.2 : 1.9} /><span>{n.label}</span>
      </button>
    );
    return (
      <div className="fm-app fm-mobile" data-cards={t.cards} style={accentVars}>
        <div className="fm-shell">
          <div className="fm-scroll" ref={scrollRef}>{screen}</div>
          <nav className="fm-tabbar">
            {tab1.map(navBtn)}
            <div className="fm-tab fm-tab-fab">
              <button className="fm-tab-fab-btn" data-active={tab === 'active'} onClick={onFab} aria-label="Start workout">
                <Icon name={workout ? 'play' : 'plus'} size={26} sw={2.4} color="#fff" />
              </button>
            </div>
            {tab2.map(navBtn)}
          </nav>
        </div>
      </div>
    );
  }

  return (
    <div className="fm-app fm-desktop" data-cards={t.cards} style={accentVars}>
      <div className="fm-shell">
        <aside className="fm-sidebar">
          <div className="fm-brand">
            <div className="fm-brand-mark"><Icon name="bolt" size={19} sw={2.2} color="#fff" /></div>
            <span className="fm-brand-name">Fitman</span>
          </div>
          <nav className="fm-navlist">
            <button className="fm-navitem" data-active={tab === 'home'} onClick={() => setTab('home')}><Icon name="home" size={20} /> Home</button>
            <button className="fm-navitem" data-active={tab === 'active'} onClick={onFab}><Icon name="dumbbell" size={20} /> {workout ? 'Active workout' : 'Workout'}</button>
            <button className="fm-navitem" data-active={tab === 'progress'} onClick={() => setTab('progress')}><Icon name="chart" size={20} /> Progress</button>
            <button className="fm-navitem" data-active={tab === 'history'} onClick={() => setTab('history')}><Icon name="history" size={20} /> History</button>
            <button className="fm-navitem" data-active={tab === 'library'} onClick={() => setTab('library')}><Icon name="library" size={20} /> Exercises</button>
          </nav>
          <div className="fm-side-cta">
            <button className="fm-btn fm-btn-accent fm-btn-block" onClick={onFab}>
              <Icon name={workout ? 'play' : 'plus'} size={18} sw={2.2} /> {workout ? 'Resume' : 'Start workout'}
            </button>
            <div className="fm-navitem" style={{ marginTop: 8, cursor: 'default' }}><Icon name="settings" size={20} /> Settings</div>
          </div>
        </aside>
        <main className="fm-main" ref={scrollRef}>{screen}</main>
      </div>
    </div>
  );
}
Object.assign(window, { App, Header, makeWorkout });
