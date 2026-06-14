# Architecture

## Overview

Fitman is a two-service web application: a Python REST API and a React single-page app. Both run as Docker containers on a home server and are accessed remotely via Tailscale.

```
                         ┌─────────────────────────────────────────┐
                         │              Your Home Server            │
                         │                                          │
  iPhone / Laptop        │   ┌─────────────┐   ┌───────────────┐  │
  ──────────────         │   │   Frontend  │   │    Backend    │  │
   Tailscale VPN ────────┼──▶│  React SPA  │──▶│   FastAPI     │  │
                         │   │  Port 3000  │   │   Port 8000   │  │
                         │   └─────────────┘   └───────┬───────┘  │
                         │                             │           │
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
- Runs on port `8000` inside Docker

### Frontend — React + TypeScript

- Single-page app, mobile-first responsive layout
- Communicates with the backend API over HTTP
- Tailwind CSS for styling — optimised for both touch and mouse input
- Runs on port `3000` inside Docker (served by Nginx in production)

### Database — SQLite

- Single file (`fitman.db`) stored in a Docker volume
- Easy to back up: just copy the file
- Sufficient for a single-user app — no separate database server needed

## Directory structure

```
Fitman/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── routers/             # API route handlers (workouts, exercises, etc.)
│   ├── models/              # SQLAlchemy database models
│   ├── schemas/             # Pydantic request/response schemas
│   ├── database.py          # DB connection and session setup
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── pages/           # Top-level route pages
│   │   ├── components/      # Reusable UI components
│   │   ├── hooks/           # Custom React hooks (data fetching, etc.)
│   │   └── api/             # API client functions
│   ├── package.json
│   └── tailwind.config.js
│
├── docker-compose.yml       # Orchestrates backend + frontend containers
├── .env.example             # Template for environment variables
├── README.md
├── ARCHITECTURE.md
└── DESIGN.md
```

## Database schema

### Strength training

```
exercises
  id         INTEGER PRIMARY KEY
  name       TEXT NOT NULL          -- e.g. "Flat DB Bench Press"
  muscles    TEXT                   -- e.g. "Chest, Front delt, Triceps"
  session    TEXT NOT NULL          -- "Push A" | "Pull A" | "Legs A"
  position   INTEGER NOT NULL       -- display order within the session
  type       TEXT NOT NULL          -- "weight" | "bodyweight"
  equip      TEXT NOT NULL          -- "Dumbbell" | "Bodyweight"

  -- Library covers dumbbell + bodyweight exercises only.
  -- No gym machines, cables, or barbells. Adding new equipment types
  -- is a future extension via new seed rows.

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
  logged_at   TEXT DEFAULT (datetime('now'))
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
  activity     TEXT NOT NULL          -- e.g. "Treadmill Run", "Rowing Machine"
  distance_m   REAL                   -- metres (null if not applicable)
  duration_s   INTEGER                -- seconds
  notes        TEXT
  logged_at    TEXT DEFAULT (datetime('now'))
```

### Body measurements

```
body_measurements
  id           INTEGER PRIMARY KEY
  recorded_at  TEXT NOT NULL DEFAULT (datetime('now'))
  weight_kg    REAL
  body_fat_pct REAL
  height_cm    REAL
  bone_mass_kg REAL
  notes        TEXT

  -- Additional measurement types (muscle mass %, waist cm, etc.)
  -- can be added as new columns via Alembic migrations.
```

## API routes

```
# Strength
GET    /api/exercises/sessions           List session names (Push A, Pull A, Legs A)
GET    /api/exercises?session=Push+A     Exercises in a session, ordered by position
POST   /api/sessions                     Start a workout session
PATCH  /api/sessions/{id}/end            Mark a session as complete
GET    /api/logs?exercise_id=1           All logged sets for an exercise
GET    /api/logs/last/{exercise_id}      Most recent set (for PREV column in active workout)
POST   /api/logs                         Save a set { exercise_id, session_id, weight, reps }

# Progress (computed — not stored)
GET    /api/progress/strength            Estimated 1RM over time per lift (Epley formula)
GET    /api/progress/volume              Total kg lifted per week
GET    /api/progress/consistency         Heatmap data (days trained per week, last 17 weeks)
GET    /api/progress/balance             Volume % breakdown by muscle group
GET    /api/progress/prs                 Personal records per exercise

# Cardio
POST   /api/cardio/sessions              Start a cardio session
PATCH  /api/cardio/sessions/{id}/end     End a cardio session
POST   /api/cardio/logs                  Log an activity { session_id, activity, distance_m, duration_s }

# Body measurements
GET    /api/measurements                 All recorded measurements (newest first)
POST   /api/measurements                 Record a measurement { weight_kg, body_fat_pct, ... }
```

## Seed data

On first run the database is seeded with a Push/Pull/Legs A programme using
dumbbells and bodyweight exercises only — no machines, cables, or barbells.

```
Push A   Flat DB Bench Press (weight) · Incline DB Press (weight)
         Seated DB Shoulder Press (weight) · DB Lateral Raise (weight)
         Overhead Triceps Extension (weight) · Push-Up (bodyweight)
         Chest Dip (bodyweight)

Pull A   One-Arm DB Row (weight) · Chest-Supported DB Row (weight)
         DB Pullover (weight) · DB Rear Delt Fly (weight)
         Incline DB Curl (weight) · DB Hammer Curl (weight)
         Pull-Up (bodyweight)

Legs A   DB Goblet Squat (weight) · Bulgarian Split Squat (weight)
         DB Reverse Lunge (weight) · Romanian Deadlift (weight)
         Glute Bridge (bodyweight) · Single-Leg Calf Raise (bodyweight)
```

## Auth flow

1. User logs in with username + password
2. Backend returns a JWT access token
3. Frontend stores the token and sends it in the `Authorization` header on every API request
4. Token expires after a configurable time (default: 7 days) — user logs in again

Since Tailscale already restricts who can reach the server, JWT here primarily prevents accidents rather than acting as the sole security layer.

## Docker Compose

```yaml
# docker-compose.yml (simplified overview)
services:
  backend:
    build: ./backend
    ports: ["8000:8000"]
    volumes:
      - db_data:/app/data   # SQLite file persists here

  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    depends_on: [backend]

volumes:
  db_data:
```

## Hosting & access

- The server runs Docker Compose continuously (via `docker compose up -d`)
- Tailscale is installed on the server and on your phone/laptop
- No port forwarding or public IP needed — Tailscale creates a private encrypted network
- Access the app at `http://fitman` (or whatever Tailscale hostname you configure)
