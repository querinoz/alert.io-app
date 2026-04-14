# Alert.io — Community Safety Platform

> Real-time incident reporting, family safety, and community vigilance. A full-stack monorepo with **Web App**, **REST API**, **Landing Page**, and **Dev Tooling**.

[![Tests](https://img.shields.io/badge/tests-55%20passed-brightgreen)](#testing)
[![Platform](https://img.shields.io/badge/platform-web%20%7C%20iOS%20%7C%20android-blue)](#platforms)
[![License](https://img.shields.io/badge/license-MIT-green)](#license)

## Repository Structure

```
attention-app/                    # Monorepo root
├── app/                          # Expo Router screens (web + mobile)
├── src/                          # Shared source (components, services, stores, theme)
├── __tests__/                    # Jest test suite (55 tests)
├── alert-backend/                # Hono + TypeScript REST API + WebSocket
│   ├── src/                      # API routes, middleware, database
│   ├── migrations/               # PostgreSQL schema
│   └── Dockerfile                # Multi-stage production build
├── alert-io/                     # Static landing page (HTML + CSS + JS)
├── tile-proxy/                   # Map tile proxy for dev environments
├── docker-compose.yml            # PostgreSQL + API orchestration
├── .env.example                  # All environment variables documented
└── docs/                         # Architecture, database, reputation docs
```

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/sae3ovr/attention-app.git
cd attention-app
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
# Edit .env — Firebase keys are optional (app works in demo mode)
# Docker vars (POSTGRES_PASSWORD) are required for backend
```

### 3. Start the Backend (Docker)

```bash
docker-compose up -d
```

This starts:
- **PostgreSQL 16** on `localhost:5432` (localhost only)
- **Redis 7** on `localhost:6379` (localhost only)
- **REST API + WebSocket** on `localhost:3000`

### 4. Run the Web App

```bash
npx expo start --web --port 8081
```

### 5. Run on Mobile

```bash
# Android / iOS via Expo Go
npx expo start --lan --port 8081
```

### 6. Serve the Landing Page

```bash
npx serve -s -l 8080 alert-io
```

## All Platforms

| Component | Technology | Run Command | Port |
|-----------|-----------|-------------|------|
| **Web App** | Expo + React Native Web | `npx expo start --web` | 8081 |
| **Mobile App** | Expo + React Native | `npx expo start --lan` | 8081 |
| **REST API + WS** | Hono + Socket.io | `docker-compose up -d` | 3000 |
| **Landing Page** | Static HTML/JS | `npx serve -s -l 8080 alert-io` | 8080 |
| **Tile Proxy** | Node.js | `node tile-proxy/server.js` | 8888 |

## Features

### Web + Mobile App (Expo)
- **Real-time incident mapping** with MapLibre GL JS + animated markers
- **AI credibility engine** scoring reports by text quality, geography, history
- **22+ live public cameras** (YouTube, MJPG streams) — no API keys needed
- **Drive mode** with OSRM navigation + speed camera alerts via Overpass API
- **GuardScan radar** — visual sweep discovering incidents in configurable radius
- **Chain system** — link friends, pets, vehicles, devices with real-time location
- **Family safety** — groups, Kid Mode, safe zones, SOS, battery monitoring
- **32-level badge system** from Observador Iniciante to Guardião Supremo
- **ErrorBoundary** — graceful crash recovery
- **Accessibility** — VoiceOver/TalkBack labels, high contrast, reduced motion

### Backend API
- **Hono** framework with secure headers, CORS, structured logging
- **Firebase Auth** token verification (no custom JWT/bcrypt)
- **Socket.io WebSockets** for real-time location, SOS, incidents, votes
- **Redis** cache (incidents 30s, cameras 5min) + Socket.io pub/sub adapter
- Parameterized SQL (no injection)
- Ownership verification on family/chain operations
- Multi-stage Docker build (non-root, healthcheck)

### Landing Page
- Animated hero, live MapLibre demo, pricing, login/register
- Open Graph + Twitter Card SEO
- Configurable app URL via `window.ALERT_APP_URL`

## Environment Variables

```bash
# === Firebase (optional — demo mode works without these) ===
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=

# === App behavior ===
EXPO_PUBLIC_ENABLE_AUTO_DEMO=false

# === Docker / Backend (required for API) ===
POSTGRES_DB=alertio
POSTGRES_USER=alertio
POSTGRES_PASSWORD=<strong-random-password>
NODE_ENV=development
CORS_ORIGINS=http://localhost:8081,http://localhost:8080
EXPO_PUBLIC_API_URL=http://localhost:3000
FIREBASE_PROJECT_ID=your_project_id
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Testing

```bash
# Expo app tests (55 tests)
npm test

# Backend type check
cd alert-backend && npx tsc --noEmit

# Expo lint
npx expo lint

# Web build
npx expo export --platform web
```

## Architecture

```
┌─────────────┐     ┌──────────────┐
│  Landing     │     │  Web/Mobile  │
│  (alert-io)  │────▶│  (Expo)      │
│  Port 8080   │     │  Port 8081   │
└─────────────┘     └──────┬───────┘
                           │ HTTP + WebSocket
                           ▼
                    ┌──────────────┐     ┌──────────────┐
                    │  Hono API +  │     │  Tile Proxy  │
                    │  Socket.io   │     │  (tile-proxy)│
                    │  Port 3000   │     │  Port 8888   │
                    └──┬───────┬───┘     └──────────────┘
                       │       │
                       ▼       ▼
                ┌──────────┐ ┌──────────┐
                │PostgreSQL│ │  Redis   │
                │Port 5432 │ │ Port 6379│
                └──────────┘ └──────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Web/Mobile Framework** | React Native + Expo (SDK 52) |
| **Backend** | Hono + @hono/node-server + TypeScript |
| **WebSocket** | Socket.io + Redis adapter |
| **Database** | PostgreSQL 16 |
| **Cache / PubSub** | Redis 7 |
| **Auth** | Firebase Authentication (Admin SDK) |
| **Map** | MapLibre GL JS + OpenFreeMap |
| **State** | Zustand |
| **Testing** | Jest + ts-jest |
| **Deployment** | Vercel (web), EAS Build (mobile), Docker (API) |

## Security

- No hardcoded secrets — all env-driven with fail-fast in production
- Firebase Auth token verification via Admin SDK
- CORS restricted to configured origins
- Secure headers (CSP, HSTS, Permissions-Policy) via Hono middleware
- Multi-stage Docker build with non-root user
- Redis on localhost-only binding
- No cleartext HTTP traffic in production

## Detailed Documentation

| Doc | Location |
|-----|----------|
| Backend API docs | [`alert-backend/README.md`](alert-backend/README.md) |
| Landing page docs | [`alert-io/README.md`](alert-io/README.md) |
| Tile proxy docs | [`tile-proxy/README.md`](tile-proxy/README.md) |
| Architecture | [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) |
| Database schema | [`docs/DATABASE.md`](docs/DATABASE.md) |
| Reputation system | [`docs/REPUTATION.md`](docs/REPUTATION.md) |
| SDK documentation | [`docs/SDK.md`](docs/SDK.md) |

## License

MIT
