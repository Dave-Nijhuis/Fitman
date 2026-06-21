# Architecture

## Overview

Fitman is a two-service web application: a Python REST API and a React single-page app. Both run as Docker containers on a home server and are accessed remotely via Tailscale.

```
                         ┌─────────────────────────────────────────┐
                         │              Your Home Server            │
                         │                                          │
  iPhone / Laptop        │   ┌─────────────┐   ┌───────────────┐  │
  ──────────────         │   │    nginx    │   │    Backend    │  │
   Tailscale VPN ────────┼──▶│  Port 80   │──▶│   FastAPI     │  │
                         │   │  (static +  │   │   Port 8000   │  │
                         │   │   proxy)    │   └───────┬───────┘  │
                         │   └─────────────┘           │           │
                         │                     ┌───────▼───────┐  │
                         │                     │   SQLite DB   │  │
                         │                     │  fitman.db    │  │
                         │                     └───────────────┘  │
                         └─────────────────────────────────────────┘
```

## Services

### Backend — FastAPI (Python)

- Serves a REST JSON API consumed by the frontend
- Handles authentication (JWT tokens)
- Reads and writes all data to SQLite via SQLAlchemy
- Runs database migrations automatically on startup via Alembic
- Runs on port `8000` inside Docker (internal only — not exposed to the host)

### Frontend — React + TypeScript

- Single-page app, mobile-first responsive layout
- Communicates with the backend via nginx proxy (no direct connection to port 8000)
- Tailwind CSS v4 for styling
- In production: built to static files and served by nginx
- In development: Vite dev server on port `5173` with `/api` proxy to backend

### Database — SQLite

- Single file (`fitman.db`) stored in a Docker volume (`db_data`)
- Easy to back up: just copy the file
- Sufficient for a single-user app — no separate database server needed

## Directory structure

```
Fitman/
├── backend/
│   ├── main.py              # FastAPI app entry point + startup validation
│   ├── auth.py              # JWT creation and verification
│   ├── database.py          # DB connection and session setup
│   ├── seed.py              # Initial exercise data
│   ├── entrypoint.sh        # Docker entrypoint: runs migrations then uvicorn
│   ├── routers/             # API route handlers
│   │   ├── auth.py          # POST /api/auth/login
│   │   ├── exercises.py     # GET /api/exercises
│   │   ├── sessions.py      # Workout session management
│   │   ├── logs.py          # Set logging
│   │   ├── progress.py      # Progress calculations
│   │   ├── measurements.py  # Body measurements
│   │   ├── cardio.py        # Cardio logging
│   │   └── stats.py         # Home dashboard stats
│   ├── models/              # SQLAlchemy database models
│   │   ├── exercise.py
│   │   ├── workout.py
│   │   ├── cardio.py
│   │   └── measurement.py
│   ├── alembic/             # Database migrations
│   │   └── versions/        # One file per schema change
│   ├── alembic.ini
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── requirements-dev.txt # Dev/CI dependencies (pytest, ruff, mypy)
│   ├── pyproject.toml       # Ruff and mypy configuration
│   └── tests/               # pytest test suite
│
├── frontend/
│   ├── src/
│   │   ├── pages/           # Top-level route pages
│   │   ├── components/      # Reusable UI components (BottomNav, RestTimer, etc.)
│   │   └── api/             # API client functions
│   ├── nginx.conf           # nginx config used in production Docker image
│   ├── Dockerfile.prod      # Multi-stage: Node build → nginx serve
│   ├── Dockerfile           # Dev only: Vite dev server
│   └── package.json
│
├── docker-compose.yml       # Development: Vite dev server + backend
├── docker-compose.prod.yml  # Production: nginx static build + backend
├── .env                     # Secrets and config — never committed (gitignored)
├── .env.example             # Template documenting all variables
├── README.md
├── ARCHITECTURE.md
├── DESIGN.md
└── SCALE.md                 # Smart scale BLE protocol documentation
```

## Database schema

### Strength training

```
exercises
  id         INTEGER PRIMARY KEY
  name       TEXT NOT NULL          -- e.g. "Flat DB Bench Press"
  muscles    TEXT                   -- e.g. "Chest, Front Delt, Triceps"
  session    TEXT NOT NULL          -- "Push A" | "Pull A" | "Legs A"
  position   INTEGER NOT NULL       -- display order within the session
  type       TEXT NOT NULL          -- "weight" | "bodyweight"
  equip      TEXT NOT NULL          -- "Dumbbell" | "Bodyweight"

workout_sessions
  id          INTEGER PRIMARY KEY
  session     TEXT NOT NULL          -- "Push A" | "Pull A" | "Legs A"
  started_at  TEXT NOT NULL
  ended_at    TEXT                   -- null while in progress

logs
  id          INTEGER PRIMARY KEY
  exercise_id INTEGER REFERENCES exercises(id)
  session_id  INTEGER REFERENCES workout_sessions(id)
  weight      REAL NOT NULL          -- kg (0 for bodyweight exercises)
  reps        INTEGER NOT NULL
  logged_at   TEXT NOT NULL
```

### Cardio

```
cardio_sessions
  id          INTEGER PRIMARY KEY
  started_at  TEXT NOT NULL
  ended_at    TEXT

cardio_logs
  id           INTEGER PRIMARY KEY
  session_id   INTEGER REFERENCES cardio_sessions(id)
  activity     TEXT NOT NULL          -- "Run" | "Walk" | "Bike" | "Swim" | "Row" | "Other"
  distance_m   REAL                   -- metres (null if not tracked)
  duration_s   INTEGER                -- seconds (null if not tracked)
  notes        TEXT
  logged_at    TEXT NOT NULL
```

### Body measurements

```
body_measurements
  id           INTEGER PRIMARY KEY
  recorded_at  TEXT NOT NULL
  weight_kg    REAL
  body_fat_pct REAL
  height_cm    REAL
  bone_mass_kg REAL
  notes        TEXT
```

## API routes

```
# Auth
POST   /api/auth/login                   Returns JWT token

# Exercises
GET    /api/exercises/sessions            List session names (Push A, Pull A, Legs A)
GET    /api/exercises                     All exercises (optional ?session= and ?search= filters)
GET    /api/exercises/{id}               Single exercise by ID

# Strength logging
POST   /api/sessions                      Start a workout session
PATCH  /api/sessions/{id}/end            End a workout session
GET    /api/sessions                      List completed sessions with volume + set count
GET    /api/sessions/{id}/logs           All logs for a session
POST   /api/logs                          Log a set { exercise_id, session_id, weight, reps }
GET    /api/logs/last/{exercise_id}      Most recent set for an exercise

# Progress
GET    /api/progress/strength?exercise_id=X   Estimated 1RM over time (Epley formula)
GET    /api/progress/volume                    Total kg lifted per week
GET    /api/progress/consistency              17-week training heatmap data
GET    /api/progress/balance                  Volume % breakdown by muscle group
GET    /api/progress/prs                      Personal records per exercise

# Home stats
GET    /api/stats/home                    Streak, weekly volume, workouts this week

# Cardio
GET    /api/cardio/activities             List supported activity types
POST   /api/cardio                        Log a cardio entry { activity, distance_m, duration_s, notes }
GET    /api/cardio                        All cardio entries (newest first)
DELETE /api/cardio/{id}                  Delete a cardio entry

# Body measurements
POST   /api/measurements                  Log a measurement { weight_kg, body_fat_pct, ... }
GET    /api/measurements                  All measurements (newest first)
DELETE /api/measurements/{id}            Delete a measurement

# System
GET    /health                            Health check
```

## Environment variables

All configuration lives in `.env` at the project root. See `.env.example` for a documented template.

| Variable | Required | Default | Description |
|---|---|---|---|
| `SECRET_KEY` | ✅ | — | Random string for signing JWT tokens |
| `ADMIN_USERNAME` | ✅ | — | Login username |
| `ADMIN_PASSWORD` | ✅ | — | Login password |
| `JWT_EXPIRE_DAYS` | | `7` | Token validity in days |
| `DATA_DIR` | | `./data` | SQLite file location (`/app/data` in Docker) |
| `CORS_ORIGINS` | | `http://localhost:3000` | Allowed frontend origins |

The backend refuses to start if any required variable is missing.

## Auth flow

1. User logs in with username + password → `POST /api/auth/login`
2. Backend returns a JWT access token
3. Frontend stores the token in localStorage and sends it as `Authorization: Bearer <token>` on every request
4. Token expires after `JWT_EXPIRE_DAYS` days — user logs in again

Since Tailscale already restricts who can reach the server, JWT here primarily prevents accidents rather than acting as the sole security layer.

## Docker Compose

Two compose files — one for each environment:

```
# Development (npm run dev inside Docker, hot reload)
docker compose up

# Production (static build served by nginx)
docker compose -f docker-compose.prod.yml up -d
```

In production, only nginx (port 80) is exposed to the host. The backend runs on an internal Docker network — nginx proxies `/api/` requests to it.

On every container start, `entrypoint.sh` runs `alembic upgrade head` before starting uvicorn, so database migrations apply automatically on deploy.

## Hosting & access

- The server runs Docker Compose continuously (`docker compose -f docker-compose.prod.yml up -d`)
- Tailscale is installed on the server and on your phone/laptop
- No port forwarding or public IP needed — Tailscale creates a private encrypted network
- Access the app at `http://fitman.local` (or whatever Tailscale hostname you configure)
