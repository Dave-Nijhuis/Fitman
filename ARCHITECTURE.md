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

```
exercises
  id         INTEGER PRIMARY KEY
  name       TEXT NOT NULL          -- e.g. "Flat DB Bench Press"
  muscles    TEXT                   -- e.g. "Chest, Front delt, Triceps"
  session    TEXT NOT NULL          -- "Push A" | "Pull A" | "Legs A"
  position   INTEGER NOT NULL       -- display order within the session

logs
  id          INTEGER PRIMARY KEY
  exercise_id INTEGER REFERENCES exercises(id)
  weight      REAL NOT NULL         -- kg
  reps        INTEGER NOT NULL
  logged_at   TEXT DEFAULT (datetime('now'))

workout_sessions
  id          INTEGER PRIMARY KEY
  session     TEXT NOT NULL          -- "Push A" | "Pull A" | "Legs A"
  started_at  TEXT NOT NULL
  ended_at    TEXT                   -- null while in progress
```

## API routes

```
GET    /api/exercises/sessions           List session names (Push A, Pull A, Legs A)
GET    /api/exercises?session=Push+A     Exercises in a session, ordered by position
GET    /api/logs?exercise_id=1           All logged sets for an exercise
GET    /api/logs/last/{exercise_id}      Most recent set for an exercise
POST   /api/logs                         Save a set { exercise_id, weight, reps }
POST   /api/sessions                     Start a new workout session
PATCH  /api/sessions/{id}/end            Mark a session as complete
```

## Seed data

On first run the database is seeded with a dumbbell Push/Pull/Legs A programme:

```
Push A   Flat DB Bench Press · Incline DB Press · Seated DB Shoulder Press
         DB Lateral Raise · Overhead Triceps Extension

Pull A   One-Arm DB Row · Chest-Supported DB Row · DB Pullover
         DB Rear Delt Fly · Incline DB Curl · DB Hammer Curl

Legs A   DB Goblet Squat · Bulgarian Split Squat · DB Reverse Lunge
         Romanian Deadlift · Single-Leg Calf Raise
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
