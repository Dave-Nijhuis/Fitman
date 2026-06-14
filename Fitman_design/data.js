/* Fitman — mock data. Deterministic, attached to window.FITMAN_DATA */
(function () {
  // tiny seeded PRNG for deterministic "organic" series
  function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

  const MUSCLE_COLORS = {
    Chest: '#ff5a36', Back: '#f0803a', Legs: '#e0a13d',
    Shoulders: '#d96b4f', Arms: '#c98b4a', Core: '#b9603e', Cardio: '#5b8fb0'
  };

  const exercises = [
    { id:'bench',     name:'Barbell Bench Press',     muscle:'Chest',     type:'weight',     equip:'Barbell' },
    { id:'incline',   name:'Incline Dumbbell Press',  muscle:'Chest',     type:'weight',     equip:'Dumbbell' },
    { id:'dip',       name:'Chest Dip',               muscle:'Chest',     type:'bodyweight', equip:'Bodyweight' },
    { id:'pushup',    name:'Push-Up',                 muscle:'Chest',     type:'bodyweight', equip:'Bodyweight' },
    { id:'squat',     name:'Back Squat',              muscle:'Legs',      type:'weight',     equip:'Barbell' },
    { id:'legpress',  name:'Leg Press',               muscle:'Legs',      type:'weight',     equip:'Machine' },
    { id:'rdl',       name:'Romanian Deadlift',       muscle:'Legs',      type:'weight',     equip:'Barbell' },
    { id:'lunge',     name:'Walking Lunge',           muscle:'Legs',      type:'bodyweight', equip:'Bodyweight' },
    { id:'deadlift',  name:'Conventional Deadlift',   muscle:'Back',      type:'weight',     equip:'Barbell' },
    { id:'row',       name:'Bent-Over Row',           muscle:'Back',      type:'weight',     equip:'Barbell' },
    { id:'pullup',    name:'Pull-Up',                 muscle:'Back',      type:'bodyweight', equip:'Bodyweight' },
    { id:'latpull',   name:'Lat Pulldown',            muscle:'Back',      type:'weight',     equip:'Cable' },
    { id:'ohp',       name:'Overhead Press',          muscle:'Shoulders', type:'weight',     equip:'Barbell' },
    { id:'lateral',   name:'Lateral Raise',           muscle:'Shoulders', type:'weight',     equip:'Dumbbell' },
    { id:'facepull',  name:'Face Pull',               muscle:'Shoulders', type:'weight',     equip:'Cable' },
    { id:'curl',      name:'Dumbbell Curl',           muscle:'Arms',      type:'weight',     equip:'Dumbbell' },
    { id:'pushdown',  name:'Cable Triceps Pushdown',  muscle:'Arms',      type:'weight',     equip:'Cable' },
    { id:'plank',     name:'Plank',                   muscle:'Core',      type:'bodyweight', equip:'Bodyweight' },
    { id:'hangleg',   name:'Hanging Leg Raise',       muscle:'Core',      type:'bodyweight', equip:'Bodyweight' },
    { id:'run',       name:'Treadmill Run',           muscle:'Cardio',    type:'cardio',     equip:'Machine' },
    { id:'cycle',     name:'Indoor Cycling',          muscle:'Cardio',    type:'cardio',     equip:'Machine' },
    { id:'rower',     name:'Rowing Machine',          muscle:'Cardio',    type:'cardio',     equip:'Machine' },
  ];
  const exById = Object.fromEntries(exercises.map(e => [e.id, e]));

  // today's plan — Push Day
  const todayPlan = {
    name: 'Push Day', focus: 'Chest · Shoulders · Triceps', estMin: 52,
    items: [
      { exId:'bench',    sets:[{w:80,r:5},{w:80,r:5},{w:82.5,r:5},{w:82.5,r:5}] },
      { exId:'incline',  sets:[{w:28,r:10},{w:28,r:10},{w:30,r:9}] },
      { exId:'ohp',      sets:[{w:45,r:6},{w:45,r:6},{w:45,r:6}] },
      { exId:'lateral',  sets:[{w:12,r:14},{w:12,r:14},{w:12,r:13}] },
      { exId:'pushdown', sets:[{w:30,r:12},{w:32,r:11},{w:32,r:10}] },
      { exId:'dip',      sets:[{w:0,r:12},{w:0,r:11}] },
    ]
  };

  // history — recent sessions (most recent first)
  const history = [
    { id:'h1', dd:12, mo:'JUN', name:'Pull Day',  durationMin:58, volume:11240, muscles:['Back','Arms'],
      exercises:[ {name:'Deadlift',sets:[{w:170,r:3},{w:170,r:3},{w:180,r:2}]},{name:'Pull-Up',sets:[{w:0,r:9},{w:0,r:8},{w:0,r:7}]},
                  {name:'Bent-Over Row',sets:[{w:80,r:8},{w:80,r:8},{w:80,r:7}]},{name:'Dumbbell Curl',sets:[{w:16,r:11},{w:16,r:10}]} ] },
    { id:'h2', dd:10, mo:'JUN', name:'Leg Day',   durationMin:64, volume:14820, muscles:['Legs'],
      exercises:[ {name:'Back Squat',sets:[{w:120,r:5},{w:120,r:5},{w:125,r:4}]},{name:'Romanian Deadlift',sets:[{w:100,r:8},{w:100,r:8}]},
                  {name:'Leg Press',sets:[{w:200,r:12},{w:220,r:10}]},{name:'Walking Lunge',sets:[{w:20,r:12},{w:20,r:12}]} ] },
    { id:'h3', dd:8,  mo:'JUN', name:'Push Day',  durationMin:51, volume:9650,  muscles:['Chest','Shoulders'],
      exercises:[ {name:'Barbell Bench Press',sets:[{w:80,r:5},{w:80,r:5},{w:82.5,r:4}]},{name:'Incline Dumbbell Press',sets:[{w:28,r:10},{w:28,r:9}]},
                  {name:'Overhead Press',sets:[{w:45,r:6},{w:45,r:5}]},{name:'Lateral Raise',sets:[{w:12,r:14},{w:12,r:13}]} ] },
    { id:'h4', dd:6,  mo:'JUN', name:'Conditioning', durationMin:32, volume:0, cardio:true, muscles:['Cardio'],
      exercises:[ {name:'Treadmill Run',sets:[{label:'5.2 km · 27:40'}]},{name:'Rowing Machine',sets:[{label:'1500 m · 6:10'}]} ] },
    { id:'h5', dd:5,  mo:'JUN', name:'Pull Day',  durationMin:55, volume:10720, muscles:['Back','Arms'],
      exercises:[ {name:'Deadlift',sets:[{w:165,r:3},{w:165,r:3},{w:170,r:3}]},{name:'Lat Pulldown',sets:[{w:65,r:10},{w:65,r:10}]},
                  {name:'Face Pull',sets:[{w:25,r:15},{w:25,r:15}]} ] },
    { id:'h6', dd:3,  mo:'JUN', name:'Leg Day',   durationMin:61, volume:13980, muscles:['Legs'],
      exercises:[ {name:'Back Squat',sets:[{w:115,r:5},{w:120,r:5},{w:120,r:5}]},{name:'Leg Press',sets:[{w:200,r:12},{w:210,r:11}]} ] },
    { id:'h7', dd:1,  mo:'JUN', name:'Push Day',  durationMin:49, volume:9320,  muscles:['Chest','Shoulders'],
      exercises:[ {name:'Barbell Bench Press',sets:[{w:77.5,r:6},{w:80,r:5},{w:80,r:5}]},{name:'Overhead Press',sets:[{w:42.5,r:7},{w:45,r:6}]} ] },
    { id:'h8', dd:29, mo:'MAY', name:'Pull Day',  durationMin:53, volume:10310, muscles:['Back','Arms'],
      exercises:[ {name:'Deadlift',sets:[{w:160,r:4},{w:165,r:3}]},{name:'Pull-Up',sets:[{w:0,r:8},{w:0,r:7}]} ] },
  ];

  // strength progression — est. 1RM over 12 weeks per lift
  const r1 = mulberry32(7);
  function trend(start, gain, noise){ const a=[]; for(let i=0;i<12;i++){ a.push(Math.round(start + gain*i + (r1()-0.4)*noise)); } return a; }
  const weeks = ['','','','','','','','','','','',''].map((_,i)=>`W${i+1}`);
  const strength = {
    bench:    { name:'Bench Press', unit:'kg', series: trend(88, 1.3, 4), pr:{ val:102, when:'2 wks ago' } },
    squat:    { name:'Back Squat',  unit:'kg', series: trend(120, 2.1, 6), pr:{ val:147, when:'this week' } },
    deadlift: { name:'Deadlift',    unit:'kg', series: trend(160, 2.4, 7), pr:{ val:192, when:'4 days ago' } },
    ohp:      { name:'Overhead Press', unit:'kg', series: trend(50, 0.9, 3), pr:{ val:62, when:'3 wks ago' } },
  };

  // total volume per week (last 10 weeks), in kg
  const volume = [28400, 31200, 29800, 33100, 30500, 35200, 34000, 37600, 36100, 39800].map((v,i)=>({ label:`W${i+1}`, v }));

  // body weight (kg) last 12 entries, goal line
  const r2 = mulberry32(21);
  const bodyweight = []; let bw = 84.2;
  for(let i=0;i<12;i++){ bodyweight.push({ label:`${i*3+1}`, v: +(bw).toFixed(1) }); bw -= 0.35 + (r2()-0.5)*0.4; }
  const bwGoal = 80;

  // streak heatmap — 17 weeks x 7 days intensity 0..4
  const r3 = mulberry32(99);
  const heat = [];
  for(let i=0;i<17*7;i++){ const x=r3(); heat.push(x<0.42?0 : x<0.6?1 : x<0.78?2 : x<0.92?3 : 4); }
  // make recent days strong / a streak
  for(let i=heat.length-9;i<heat.length;i++){ if(i>=0 && i!==heat.length-1) heat[i] = Math.max(heat[i], 2 + (i%3===0?2:1)); }

  // weekly muscle balance (% of volume)
  const balance = [
    { name:'Legs', pct:31 }, { name:'Back', pct:24 }, { name:'Chest', pct:18 },
    { name:'Shoulders', pct:13 }, { name:'Arms', pct:9 }, { name:'Core', pct:5 },
  ];

  // recent PRs
  const prs = [
    { lift:'Deadlift', val:192, unit:'kg', when:'4 days ago', delta:'+5kg' },
    { lift:'Back Squat', val:147, unit:'kg', when:'this week', delta:'+2.5kg' },
    { lift:'Bench Press', val:102, unit:'kg', when:'2 weeks ago', delta:'+2.5kg' },
    { lift:'Pull-Up', val:9, unit:'reps', when:'3 weeks ago', delta:'+1 rep' },
  ];

  const summary = { streak: 8, weekWorkouts: 4, weekVolume: 39800, weekMinutes: 218, totalWorkouts: 142 };

  window.FITMAN_DATA = {
    exercises, exById, todayPlan, history, strength, volume, bodyweight, bwGoal,
    heat, balance, prs, summary, weeks, MUSCLE_COLORS,
    muscleOrder: ['Chest','Back','Legs','Shoulders','Arms','Core','Cardio'],
  };
})();
