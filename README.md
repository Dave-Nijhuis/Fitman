# Fitman

A self-hosted fitness tracking app. Log workouts, track progress, own your data.

## Why self-hosted?

Commercial fitness apps either cost a recurring subscription or monetise your training data. Fitman runs on your own hardware, accessed securely via Tailscale from anywhere — home gym, outdoor gym, wherever.

## Features (planned)

- **Workout plans** — create and follow structured training programmes (initial programme: dumbbell Push/Pull/Legs A)
- **Session logging** — log sets, reps, and weight per exercise in real time
- **Progress dashboard** — visualise volume, personal records, and trends over time
- **Health tracking** — body weight, measurements, and other health markers (future)

## Tech stack

| Layer | Technology |
|---|---|
| Backend API | Python 3.11 + FastAPI |
| Frontend | React 18 + TypeScript + Tailwind CSS |
| Database | SQLite (via SQLAlchemy) |
| Auth | JWT |
| Infra | Docker Compose + Tailscale |

## Getting started

> Prerequisites: Docker and Docker Compose installed on your host machine.

```bash
# Clone the repo
git clone https://github.com/Dave-Nijhuis/Fitman.git
cd Fitman

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your preferred settings

# Start the app
docker compose up -d
```

The app will be available at `http://localhost:3000` (or via your Tailscale hostname from anywhere).

## Development setup

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full project structure.

```bash
# Backend (in /backend)
uv venv .venv
source .venv/bin/activate
uv pip install -r requirements.txt
alembic upgrade head
fastapi dev main.py

# Frontend (in /frontend)
npm install
npm run dev
```

## Branch strategy

| Branch | Purpose |
|---|---|
| `main` | Stable, production-ready |
| `dev` | Integration and testing |
| `feature/<name>` | One branch per new feature |
| `fix/<name>` | Bug fixes |

All work flows through feature branches → `dev` → `main` via pull request.

## Project board

Issues and feature tracking are managed in the [GitHub Project](https://github.com/users/Dave-Nijhuis/projects/3).

## Built with AI

This project is openly built with [Claude](https://claude.ai) as a pair programmer. No pretence — it's a hobbyist app and AI is part of the workflow from architecture to code.

## License

MIT — see [LICENSE](LICENSE).
