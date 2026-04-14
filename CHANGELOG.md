# Alert.io — Changelog

## v5.0.0 — Stack Migration

### Backend: Express → Hono
- Migrated all 7 route files and auth middleware from Express to Hono
- New entry point via `@hono/node-server` with `hono/cors`, `hono/logger`, `hono/secure-headers`
- DB layer (`db.ts`) unchanged — pure `pg` Pool

### WebSockets: Socket.io
- Added Socket.io server with events: `location:update`, `sos:trigger`, `incident:new`, `incident:vote`, `camera:status`
- Frontend `socket.io-client` integration in `src/services/socket.ts`
- Zustand stores (incident, chain, family) subscribe to real-time WebSocket events

### Cache / PubSub: Redis 7
- Added `redis:7-alpine` to Docker Compose with healthcheck
- Route caching: `GET /incidents` (30s TTL), `GET /cameras` (5min TTL)
- `@socket.io/redis-adapter` for multi-instance WebSocket pub/sub
- Cache invalidation on write operations

### Auth: Firebase Only
- Removed custom JWT (`jsonwebtoken`, `bcryptjs`) from backend
- Auth middleware now verifies Firebase ID tokens via `firebase-admin`
- Removed `/auth/login` and `/auth/register` endpoints (Firebase handles auth)
- Added `POST /auth/me/ensure` to create DB user on first authenticated request

### Removed
- `alert-flutter/` — Expo covers all mobile/web screens
- `JWT_SECRET` env var — no longer needed
- `express`, `cors`, `jsonwebtoken`, `bcryptjs` dependencies

---

## v4.0.0 — Full Platform Parity Release

### Security Boot Screen
- Animated security initialization sequence on app launch (7-step boot with progress bar, radar logo, monospace typography, scan line effect, fade-out transition)
- Matches across web and Flutter mobile platforms

### Demo Runner (Web)
- Redesigned as a compact bottom-right floating pill (no longer overlays app content)
- Reduced from 38 steps to 14 for a quick ~25s tour
- Each step runs in 1.5s with smooth progress tracking

### Sidebar Improvements (Web)
- Removed the floating popup detail panel — replaced with inline expansion on hover
- Click-to-fly: clicking any incident in sidebar flies the map to that location
- Hover preview shows description + stats inline after 800ms
- Clean solid sidebar design with proper depth shadow

### Map Enhancements
- Fixed popup z-index: incident popups now render above all markers
- Fixed marker flashing: separated marker creation from selection handling
- Markers no longer get destroyed/recreated on every selection change
- Reduced motion support for map animations (native + web)

### Elevated Animations (All Screens)
- sign-up.tsx: 3-phase entry sequence, animated verification timer bar, monospace labels
- sign-in.tsx: Monospace "CREDENTIALS" micro-label, stale authError fix
- profile.tsx: Animated reputation progress bar, monospace stat values
- chain.tsx: Wired sosGlow to SOS button shadow, monospace invite code
- report.tsx: Animated step progress line fill
- settings.tsx: Boot-style footer with "ENCRYPTED · AES-256 · REAL-TIME"
- BadgeIcon: Spring scale on mount, pulse animation for guardian badges
- LoadingRadar: Monospace "SCANNING PERIMETER..." status line

### App Icons
- Generated custom radar-themed icons (icon.png, adaptive-icon.png, favicon.png, splash-icon.png)

### Landing Page
- Full-page animated particle canvas (90 particles, mouse-reactive)
- Full-page perspective grid background
- Compact auth card (320px, smaller inputs)
- Magnetic 3D tilt on buttons and feature cards
- Smooth cursor glow trail with lerp interpolation
- Aligned hero buttons with fixed heights
- Portuguese auth tab labels

### Flutter Mobile App — Full Parity [REMOVED in v5.0.0 — replaced by Expo]
- Security boot screen matching web
- Demo user: Eduardo Q., rep 203750, level 31, guardian
- Family: Querino Family, ATN3X8KP, safe zones, kid details, check-in button
- Chain: Tabbed layout (Membros/Chat/Alertas/Adicionar), SOS with pulse, messaging
- Profile: Emergency grid (6 services), guardian stats, rep progress bar, SOS config, language selector
- Feed: Deny count on tiles, empty state with shield icon
- Map: Reporter info, Portuguese category labels, description in detail
- Auth: Portuguese labels, matching placeholders
- Badges: Full 32-level table matching web exactly
- Settings/Accessibility: Portuguese labels, boot-style footer

### Bug Fixes
- Removed dead hoverPreviewY state, glowAnim, hoverPreviewIn CSS
- Removed unused AccessibleTouchable import from report.tsx
- Removed unused TOTAL_DURATION from SecurityBootScreen
- Fixed invalid battery-50 icon to battery-medium in chain.tsx
- Fixed stale authError closure in sign-in.tsx catch block
- Fixed GlassCard background shorthand (was failing react-native-web validation)
- Fixed SecurityBootScreen animation property in StyleSheet.create
- Removed dead origAnimateCounter from landing page
