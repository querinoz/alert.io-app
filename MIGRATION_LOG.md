# Alert.io — Migration Log

Records every file/directory deleted or replaced during the v5.0.0 stack migration, with justification.

---

## Phase 1 — Flutter Removal

| Deleted | Reason |
|---------|--------|
| `alert-flutter/` (entire directory) | All 9 Flutter screens have Expo equivalents. Providers covered by Zustand stores. Expo is the sole frontend going forward. |
| README.md Flutter references | Removed Flutter rows from platforms table, features, tech stack, architecture diagram, testing commands, and docs table. |
| CHANGELOG.md Flutter entries | Marked with `[REMOVED]` to preserve history. |

## Phase 2 — Express to Hono

| Deleted / Replaced | Reason |
|---------------------|--------|
| `alert-backend/src/index.ts` | Replaced by `src/app.ts` (Hono app setup) + `src/server.ts` (entry point). |
| `express`, `@types/express` | Replaced by `hono`, `@hono/node-server`. |
| `cors`, `@types/cors` | Replaced by `hono/cors` built-in middleware. |
| All route files rewritten | Converted from Express `Router` to Hono sub-apps. Same endpoints, same SQL. |
| `alert-backend/src/middleware/auth.ts` | Converted from Express middleware to Hono `MiddlewareHandler`. |

## Phase 3 — WebSocket Addition

| Added | Purpose |
|-------|---------|
| `alert-backend/src/websocket/index.ts` | Socket.io server with events: location, SOS, incidents, votes, cameras. |
| `src/services/socket.ts` (Expo) | Socket.io client connection manager. |
| Store updates (incident, chain, family) | Added `subscribeToSocket`/`unsubscribeFromSocket` for real-time events. |

## Phase 4 — Redis Addition

| Added / Changed | Purpose |
|-----------------|---------|
| `alert-backend/src/lib/redis.ts` | ioredis client with cache helpers (`getCached`, `setCache`, `invalidateCache`). |
| `@socket.io/redis-adapter` wired | Multi-instance pub/sub for Socket.io across server replicas. |
| Redis caching on `GET /incidents` (30s) and `GET /cameras` (5min) | Reduces PostgreSQL load on high-frequency reads. |
| `redis:7-alpine` in `docker-compose.yml` | Redis service with healthcheck. |

## Phase 5 — Firebase Auth Consolidation

| Deleted / Replaced | Reason |
|---------------------|--------|
| `jsonwebtoken`, `bcryptjs` + `@types/*` | Replaced by `firebase-admin` token verification. |
| `POST /auth/login`, `POST /auth/register` | Firebase Auth handles sign-in/sign-up. Backend no longer manages credentials. |
| `signToken()` function | No longer needed; Firebase issues tokens. |
| `JWT_SECRET` env var | Removed from `.env.example` and `docker-compose.yml`. |
| `alert-backend/src/lib/firebase.ts` added | Firebase Admin SDK init for `verifyIdToken`. |
| `POST /auth/me/ensure` added | Creates DB user record on first Firebase-authenticated request. |

## Phase 6 — Cleanup

| Updated | Changes |
|---------|---------|
| `README.md` | Rewrote tech stack (Hono, WebSockets, Redis, Firebase-only auth), removed Flutter, updated architecture diagram. |
| `CHANGELOG.md` | Added v5.0.0 migration entry. |
| `.env.example` (root + backend) | Synced with new vars, removed `JWT_SECRET`. |
| `docs/ARCHITECTURE.md` | Updated for new stack. |
