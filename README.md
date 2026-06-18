# Fitman

A self-hosted fitness tracking app. Log workouts, track progress, own your data.

## Why self-hosted?

Commercial fitness apps either cost a recurring subscription or monetise your training data. Fitman runs on your own hardware, accessed securely via Tailscale from anywhere — home gym, outdoor gym, wherever.

## Features

- **Workout logging** — log sets, reps, and weight per exercise in real time with a rest timer
- **Cardio tracking** — log runs, rides, swims and more with distance and duration
- **Progress dashboard** — strength progression, weekly volume, consistency heatmap, muscle balance, and personal records
- **Body measurements** — track weight and body composition over time
- **Exercise library** — browse and search all exercises with muscle and equipment info
- **Workout history** — review past sessions with full set-by-set detail

## Tech stack

| Layer | Technology |
|---|---|
| Backend API | Python 3.11 + FastAPI |
| Frontend | React 18 + TypeScript + Tailwind CSS |
| Database | SQLite (via SQLAlchemy) |
| Auth | JWT |
| Infra | Docker Compose + nginx + Tailscale |

## Self-hosting setup

### 1. Prerequisites

- A home server or always-on machine (Linux recommended)
- [Docker](https://docs.docker.com/engine/install/) and Docker Compose installed
- A [Tailscale](https://tailscale.com) account (free tier is fine)

### 2. Install Tailscale on the server

```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
```

Log in when prompted. Your server will get a Tailscale IP (e.g. `100.x.x.x`) and optionally a hostname.

### 3. Set a Tailscale hostname (optional but recommended)

In the [Tailscale admin console](https://login.tailscale.com/admin/machines), rename your server to `fitman`. The app will then be reachable at `http://fitman` from any device on your Tailscale network.

### 4. Deploy Fitman

```bash
# Clone the repo on your server
git clone https://github.com/Dave-Nijhuis/Fitman.git
cd Fitman

# Set up environment variables
cp .env.example .env
```

Edit `.env` and fill in three required values:

```bash
# Generate a secure key:
python3 -c "import secrets; print(secrets.token_hex(32))"

SECRET_KEY=<paste generated key here>
ADMIN_USERNAME=<your username>
ADMIN_PASSWORD=<your password>
```

Then start the app:

```bash
docker compose -f docker-compose.prod.yml up -d
```

### 5. Access the app

- From your server: `http://localhost`
- From any device on Tailscale: `http://fitman` (or `http://<tailscale-ip>`)

Install the Tailscale app on your iPhone or laptop and sign in with the same account — you'll have access from anywhere without opening any ports to the internet.

### Updating to a new version

```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

### Stopping the app

```bash
docker compose -f docker-compose.prod.yml down
```

---

## Development setup

```bash
# Backend — run from the backend/ directory
cd backend
uv venv .venv --python 3.11
source .venv/bin/activate
uv pip install -r requirements.txt
alembic upgrade head
fastapi dev main.py

# Frontend — run from the frontend/ directory
cd frontend
npm install
npm run dev
```

The frontend dev server runs on `http://localhost:5173` and proxies `/api` requests to the backend automatically.

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full project structure and API reference.

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
