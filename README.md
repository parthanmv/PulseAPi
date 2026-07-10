# PulseAPI — API Performance Monitoring Platform

PulseAPI is a full-stack API performance monitoring dashboard. Register, add API endpoints, track response times and uptime, analyze historical performance, and monitor API health in real time.

## Tech Stack

### Backend
- **FastAPI** — async Python web framework
- **SQLAlchemy** — ORM with SQLite (dev) / PostgreSQL (prod)
- **Alembic** — database migrations
- **JWT** — token-based authentication

### Frontend
- **React 19** — component-based UI
- **Vite** — fast development & build tool
- **React Router v7** — client-side routing
- **Recharts** — charting library
- **Axios** — HTTP client
- **Lucide React** — icon library
- **Vanilla CSS** — custom design system

## Architecture

```
PulseAPI/
├── backend/
│   ├── api/           # Route handlers (auth, monitors)
│   ├── auth/          # JWT utilities and dependency injection
│   ├── config/        # Environment configuration
│   ├── db/            # Database engine and session
│   ├── models/        # SQLAlchemy ORM models
│   ├── schemas/       # Pydantic request/response schemas
│   ├── scheduler/     # Background monitor ping scheduler
│   └── main.py        # FastAPI app initialization
├── frontend/
│   ├── src/
│   │   ├── api/       # Axios client with auth interceptor
│   │   ├── components/# Reusable UI components
│   │   ├── context/   # React context providers
│   │   ├── hooks/     # Custom React hooks
│   │   ├── layouts/   # Dashboard layout with sidebar
│   │   ├── pages/     # Route page views
│   │   ├── routes/    # Router configuration
│   │   ├── utils/     # Date formatting utilities
│   │   ├── App.jsx    # Root component
│   │   └── main.jsx   # Entry point
│   └── vite.config.js
├── .env               # Environment variables
├── requirements.txt   # Python dependencies
├── docker-compose.yml # Docker services
└── README.md
```

## Features

- **Dashboard** — real-time metrics: uptime, latency, active monitor count
- **Monitor Management** — create, edit, pause, resume, delete API monitors
- **Detail View** — latency history chart, response log table, configuration overview
- **Authentication** — register, login, JWT session management
- **Profile** — account details and notification preferences
- **Search** — filter monitors by name or URL
- **Auto-refresh** — dashboard and monitor data refresh every 10 seconds
- **Background Scheduler** — automated HTTP health checks at configurable intervals

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+

### Backend

```bash
python -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn backend.main:app --reload
```

The API is available at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app is available at `http://localhost:5173`.

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `sqlite:///./pulseapi.db` | Database connection string |
| `SECRET_KEY` | *(random)* | JWT signing secret |
| `ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Token lifetime |
| `VITE_API_BASE_URL` | `http://localhost:8000` | Backend URL (frontend) |

## API Endpoints

### Auth
| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/auth/me` | Current user |

### Monitors
| Method | Path | Description |
|---|---|---|
| GET | `/api/monitors/` | List monitors with stats |
| POST | `/api/monitors/` | Create monitor |
| GET | `/api/monitors/{id}` | Monitor details |
| PUT | `/api/monitors/{id}` | Update monitor |
| DELETE | `/api/monitors/{id}` | Delete monitor |
| POST | `/api/monitors/{id}/toggle` | Pause/resume monitoring |
| GET | `/api/monitors/{id}/history` | Ping result history |
