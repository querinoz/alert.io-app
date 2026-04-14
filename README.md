# Alert.io — Community Safety Platform (Web + Mobile)

> Real-time incident reporting, family safety, and community vigilance. Built with **React Native + Expo SDK 52**, deployed on **Web**, **iOS**, and **Android**.

[![Tests](https://img.shields.io/badge/tests-55%20passed-brightgreen)](#testing)
[![Platform](https://img.shields.io/badge/platform-web%20%7C%20iOS%20%7C%20android-blue)](#platforms)
[![License](https://img.shields.io/badge/license-MIT-green)](#license)

## Platforms

| Platform | Map Engine | Run Command |
|----------|-----------|-------------|
| **Web** (Desktop / Mobile) | MapLibre GL JS + OpenFreeMap | `npx expo start --web` |
| **Android** | MapLibre GL JS (web view) | `npx expo start --android` |
| **iOS** | MapLibre GL JS (web view) | `npx expo start --ios` |

## Quick Start

### Prerequisites

- **Node.js 20+** — [nodejs.org](https://nodejs.org)
- **Expo Go** — Install on mobile via App Store / Google Play

### Installation

```bash
cd attention-app
npm install
```

### Environment Setup

```bash
cp .env.example .env
# Edit .env with your Firebase credentials (optional — app works in demo mode without Firebase)
```

### Run

```bash
# Web — opens at http://localhost:8081
npx expo start --web --port 8081

# Mobile (LAN mode — scan QR with Expo Go)
npx expo start --lan --port 8081

# Run tests
npm test

# Lint
npx expo lint

# Build for web (Vercel deployment)
npx expo export --platform web
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `EXPO_PUBLIC_FIREBASE_API_KEY` | No | Firebase API key (demo mode if unset) |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | No | Firebase auth domain |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | No | Firebase project ID |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | No | Firebase storage bucket |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | No | Firebase messaging sender ID |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | No | Firebase app ID |
| `EXPO_PUBLIC_ENABLE_AUTO_DEMO` | No | Set to `true` to enable auto-demo login on web |

## Architecture

```
attention-app/
├── app/                              # Expo Router screens
│   ├── +html.tsx                     # Web HTML shell
│   ├── _layout.tsx                   # Root layout + ErrorBoundary + AuthGate
│   ├── (auth)/                       # Sign-in, Sign-up with verification
│   ├── (tabs)/                       # Main tabs
│   │   ├── index.tsx                 # Map screen (responsive sidebar)
│   │   ├── chain.tsx                 # Chain member management + chat
│   │   ├── family.tsx                # Family groups & Kid Mode
│   │   └── profile.tsx               # Profile, badges, SOS, emergency services
│   ├── incident/report.tsx           # 3-step incident report wizard
│   └── settings/                     # Settings + accessibility
├── src/
│   ├── components/
│   │   ├── map/                      # AttentionMap (native + web implementations)
│   │   ├── camera/                   # CameraViewer (live streams)
│   │   ├── ui/                       # GlassCard, NeonText, NeonButton, LogoMark, etc.
│   │   └── incident/                 # IncidentCard
│   ├── services/
│   │   ├── authService.ts            # Firebase auth + demo mode
│   │   ├── publicDataService.ts      # Public safety APIs
│   │   ├── cameraService.ts          # Camera aggregation (22+ verified)
│   │   ├── credibilityEngine.ts      # AI credibility scoring
│   │   ├── database.ts               # In-memory database layer
│   │   └── mockData.ts               # Demo data & utilities
│   ├── stores/                       # Zustand state (auth, incidents, family, chain)
│   ├── hooks/                        # useAccessibility, useHaptics, useResponsive
│   ├── constants/                    # 32 Security Badges, 10+ Categories
│   ├── sdk/                          # Attention SDK (embeddable safety layer)
│   ├── i18n/                         # Multilingual (pt-BR, en, es, de)
│   ├── theme/                        # Colors, typography, spacing tokens
│   └── types/                        # TypeScript interfaces
├── __tests__/                        # Jest test suite (55 tests)
├── docs/                             # Architecture, database, reputation docs
└── scripts/                          # Build, icon generation, test scripts
```

## Features

- **Real-time incident mapping** with MapLibre GL JS + animated markers
- **AI credibility engine** scoring reports by text quality, geography, history
- **Public safety data** from UK Police, DC Open Data, Portugal dados.gov.pt
- **22+ live cameras** (YouTube, MJPG streams) — no API keys needed
- **Drive mode** with OSRM navigation + speed camera alerts
- **GuardScan radar** — visual sweep finding incidents in configurable radius
- **Chain system** — link friends, pets, vehicles, devices with real-time location
- **Family safety** — groups, Kid Mode, safe zones, SOS, battery monitoring
- **32-level badge system** from Observador Iniciante to Guardião Supremo
- **Accessibility** — VoiceOver/TalkBack labels, high contrast, reduced motion, 48px+ targets
- **ErrorBoundary** — graceful crash recovery with user-friendly error screen

## Testing

```bash
npm test              # Run all 55 tests
npm run test:loop     # Run user-loop integration test
npx expo lint         # ESLint checks
```

## Deployment

### Vercel (Web)

The app deploys to Vercel with security headers (CSP, HSTS, X-Frame-Options):

```bash
npx expo export --platform web
# Output in dist/ — deploy via Vercel CLI or git push
```

### EAS Build (Mobile)

```bash
npx eas build --platform android --profile preview
npx eas build --platform android --profile production
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React Native + Expo (SDK 52) |
| **Routing** | Expo Router |
| **State** | Zustand |
| **Map** | MapLibre GL JS + OpenFreeMap.org |
| **Auth** | Firebase Authentication (configurable) |
| **Build** | EAS Build (mobile), Metro + Vercel (web) |
| **Testing** | Jest + ts-jest |
| **Languages** | Português (BR), English, Español, Deutsch |

## Security

- **ErrorBoundary** wraps the entire app for crash recovery
- **Auto-demo login** gated behind `EXPO_PUBLIC_ENABLE_AUTO_DEMO` env flag
- **No client-side password storage** — verification flow is stateless
- **CSP + HSTS** headers configured in `vercel.json`
- **Firebase client keys** are public by design — security enforced via Firebase Rules

## License

MIT
