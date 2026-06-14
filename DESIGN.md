# Design

## Principles

- **Mobile-first** — designed for one hand in a gym. Tap targets are large, inputs are minimal.
- **Dark by default** — easier on the eyes in low-light gym environments.
- **Speed** — you should be able to log a set in under 5 seconds.
- **Glanceable** — the most important info (next exercise, rest timer, last weight) is always visible without scrolling.

## Colour palette

| Token | Value | Use |
|---|---|---|
| Background | `#111827` (gray-900) | Page background |
| Surface | `#1F2937` (gray-800) | Cards, panels |
| Border | `#374151` (gray-700) | Dividers |
| Primary | `#3B82F6` (blue-500) | Buttons, active states |
| Success | `#22C55E` (green-500) | Completed sets, PRs |
| Warning | `#F59E0B` (amber-500) | Rest timer |
| Text primary | `#F9FAFB` (gray-50) | Headings, values |
| Text muted | `#9CA3AF` (gray-400) | Labels, secondary info |

---

## Screens

### 1. Dashboard (laptop view)

The home screen after login. Shows today's scheduled workout and recent progress at a glance.

```
┌─────────────────────────────────────────────────────────────────────┐
│  FITMAN                                          [Profile] [Settings]│
├──────────────┬──────────────────────────────────────────────────────┤
│              │                                                        │
│  Navigation  │   Good morning, Dave                                  │
│              │                                                        │
│  Dashboard   │   TODAY'S WORKOUT                                      │
│  Workouts ▶  │   ┌──────────────────────────────────────────────┐   │
│  Exercises   │   │  Push A  •  5 exercises  •  ~45 min           │   │
│  Progress    │   │                                              │   │
│  History     │   │  [ Start Workout ]                           │   │
│              │   └──────────────────────────────────────────────┘   │
│              │                                                        │
│              │   RECENT PROGRESS                                      │
│              │   ┌────────────┐  ┌────────────┐  ┌────────────┐    │
│              │   │ Flat DB    │  │One-Arm Row │  │ DB Goblet  │    │
│              │   │ Bench Press│  │  ↑ 32kg    │  │   Squat   │    │
│              │   │  ↑ 30kg    │  │  +2 this   │  │  → 24kg   │    │
│              │   │  +2.5 this │  │  week      │  │  same as  │    │
│              │   │  week      │  │            │  │  last week│    │
│              │   └────────────┘  └────────────┘  └────────────┘    │
│              │                                                        │
│              │   VOLUME THIS WEEK                                     │
│              │   ▂▄▅▇█▆▄  [chart placeholder]                       │
│              │                                                        │
└──────────────┴──────────────────────────────────────────────────────┘
```

---

### 2. Active workout — exercise list (mobile)

After tapping "Start Workout". Shows the exercises for this session.

```
┌─────────────────────┐
│ ← Push A            │
│ Exercise 3 of 5     │
├─────────────────────┤
│ ✓ Flat DB Bench     │
│ ✓ Incline DB Press  │
│ ▶ DB Shoulder Press │  ← current
│   DB Lateral Raise  │
│   OHd Tricep Ext    │
├─────────────────────┤
│                     │
│  DB SHOULDER PRESS  │
│                     │
│  Last session:      │
│  Set 1: 22kg × 8    │
│  Set 2: 22kg × 8    │
│  Set 3: 22kg × 6    │
│                     │
│  [ Log Set ]        │
│                     │
└─────────────────────┘
```

---

### 3. Logging a set (mobile)

The core interaction. Big inputs, large tap targets, minimal friction.

```
┌─────────────────────┐
│ ← DB Shoulder Press │
│ Set 2 of 3          │
├─────────────────────┤
│                     │
│  WEIGHT (kg)        │
│                     │
│  ┌───┐  ┌───────┐  ┌───┐ │
│  │ - │  │  22   │  │ + │ │
│  └───┘  └───────┘  └───┘ │
│                     │
│  REPS               │
│                     │
│  ┌───┐  ┌───────┐  ┌───┐ │
│  │ - │  │   8   │  │ + │ │
│  └───┘  └───────┘  └───┘ │
│                     │
│  ┌─────────────────┐│
│  │   LOG SET ✓     ││
│  └─────────────────┘│
│                     │
│  REST TIMER         │
│     01:45           │
│  ████████░░░░░░░    │
│                     │
└─────────────────────┘
```

---

### 4. Progress chart (mobile)

Viewed from the Progress tab. Shows a single lift's history over time.

```
┌─────────────────────┐
│ ← Flat DB Bench     │
│ Last 12 weeks       │
├─────────────────────┤
│                     │
│ kg                  │
│  90 ┤            ╭─ │
│  85 ┤        ╭───╯  │
│  80 ┤   ╭────╯      │
│  75 ┤───╯           │
│     └───────────── ▶│
│     Mar  Apr  May   │
│                     │
│  PERSONAL BEST      │
│  ┌─────────────────┐│
│  │  87.5kg × 5     ││
│  │  Week 18, 2026  ││
│  └─────────────────┘│
│                     │
│  [ 1M ][ 3M ][ 1Y ] │
│                     │
└─────────────────────┘
```

---

### 5. Workout plans (laptop view)

Browse and manage your training programmes.

```
┌─────────────────────────────────────────────────────────────────────┐
│  FITMAN                                          [Profile] [Settings]│
├──────────────┬──────────────────────────────────────────────────────┤
│              │  Workout Plans                    [ + New Plan ]      │
│  Dashboard   │                                                        │
│  Workouts ▶  │  ACTIVE                                               │
│  Exercises   │  ┌──────────────────────────────────────────────┐    │
│  Progress    │  │  Push / Pull / Legs  •  6 days/week   [ ● ]  │    │
│  History     │  │  Week 4 of 12  •  Started March 2026         │    │
│              │  │  [ View Plan ]  [ Edit ]                     │    │
│              │  └──────────────────────────────────────────────┘    │
│              │                                                        │
│              │  ARCHIVED                                              │
│              │  ┌──────────────────────────────────────────────┐    │
│              │  │  Starting Strength  •  3 days/week   [ ○ ]   │    │
│              │  │  Completed Jan 2026  •  12 weeks              │    │
│              │  │  [ View Plan ]                                │    │
│              │  └──────────────────────────────────────────────┘    │
│              │                                                        │
└──────────────┴──────────────────────────────────────────────────────┘
```

---

## Navigation structure

```
App
├── Dashboard          (home — today's workout + quick stats)
├── Workouts
│   ├── Active Session (when a workout is in progress)
│   └── Plans          (browse/manage programmes)
├── Exercises          (library of all exercises)
├── Progress
│   ├── By Exercise    (e.g. bench press over time)
│   └── Volume         (weekly/monthly totals)
└── History            (log of all past sessions)
```

## Responsive behaviour

On mobile, the sidebar navigation collapses into a bottom tab bar with icons for the five top-level sections. On laptop, the full sidebar is always visible.

```
Mobile bottom bar:
┌─────────────────────────────┐
│  🏠    📋    📈    📅    ⚙️  │
│ Home  Plan  Stats  Log  More │
└─────────────────────────────┘
```
