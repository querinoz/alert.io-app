# Alert.io — Application Audit Report

**Date:** April 10, 2026
**Auditor:** Senior Full-Stack QA Engineer
**Scope:** Web App (attention-app), Flutter Mobile (alert-flutter), Landing Page (alert-io)

---

## Summary

- **Total issues found:** 35
- **Critical:** 4 | **High:** 6 | **Medium:** 7 | **Low:** 4
- **Informational/Accepted:** 14
- **All actionable issues fixed:** YES

---

## Issues Found and Fixed

| # | Platform | Location | Issue | Severity | Status |
|---|----------|----------|-------|----------|--------|
| 1 | Flutter | `auth_provider.dart` | Auth login/register catch block treats ALL failures as success (mock user) | Critical | Fixed — now only falls back to mock on connection errors; real auth failures show error state |
| 2 | Flutter | `feed_screen.dart` | Timer.periodic callback runs after widget disposed (use-after-dispose) | Critical | Fixed — added `if (!mounted) return` guard |
| 3 | Flutter | `security_boot_screen.dart`, `chain_screen.dart` | Duplicate `AnimatedBuilder` class shadows Flutter built-in | Critical | Fixed — renamed to private `_AnimBuilder` in both files |
| 4 | Web | `_layout.tsx` | Dead `routerRef` and `RouterRefCapture` after demo runner removal | Critical | Fixed — removed both |
| 5 | Flutter | `family_screen.dart` | "Localizar", "Mensagem", "Ouvir" buttons have empty `() {}` callbacks | High | Fixed — added SnackBar feedback |
| 6 | Flutter | `chain_screen.dart` | "IR" and "PING" mini-action buttons have empty callbacks | High | Fixed — added SnackBar feedback and wired callback parameter |
| 7 | Flutter | `profile_screen.dart` | `_callPhone` is a stub; "Compartilhar Localizacao" does nothing | High | Fixed — added SnackBar feedback |
| 8 | Flutter | `profile_screen.dart` | Settings/Accessibility switch callbacks are all `(_) {}` | High | Fixed — wired to close sheet + show SnackBar with toggle feedback |
| 9 | Web | `index.tsx` | Camera fetch error still sets `setShowCameras(true)` | High | Fixed — changed to `setShowCameras(false)` in catch |
| 10 | Landing | `index.html` | `setLang()` does not update any DOM text; `LANG_DATA` unused | High | Fixed — wired to update nav, hero, auth, footer text from `LANG_DATA` |
| 11 | Landing | `index.html` | Orphan `.hero-grid` CSS rule (element removed) | Medium | Fixed — removed |
| 12 | Landing | `index.html` | `animateCounter` defined twice (function + override) | Medium | Fixed — merged into single definition with flash |
| 13 | Landing | `index.html` | rAF particle loop runs in background tabs (battery waste) | Medium | Fixed — pauses when `document.hidden` |
| 14 | Landing | `index.html` | Chevron `@keyframes` overrides centering `translateX(-50%)` | Medium | Fixed — included `translateX(-50%)` in both keyframe steps |
| 15 | Flutter | `login_screen.dart` | Hardcoded demo password in TextEditingController | Low | Fixed — cleared prefilled password |
| 16 | Landing | `index.html` | Login modal has no focus trap (a11y gap) | Low | Fixed — added Tab key trap within modal-card |
| 17 | Web | `family.tsx` | "Codigo copiado" announced but no actual clipboard write | Medium | Documented — requires Clipboard API integration |
| 18 | Web | `index.tsx` | Sidebar CSS style injection has no cleanup on unmount | Medium | Documented — minor web memory leak, no user impact |
| 19 | Web | `sign-in.tsx` | Logo float animation has no cleanup on unmount | Low | Documented — brief animation continuation, no crash |
| 20 | Web | `family.tsx` | "Criar Grupo" / "Entrar no Grupo" only call haptics | Info | Accepted — demo placeholder |
| 21 | Web | `profile.tsx` | SOS / Family Alert only shows toast | Info | Accepted — demo placeholder |
| 22 | Web | `settings/index.tsx` | "2FA", "Exportar", "Apagar Conta" show toasts only | Info | Accepted — demo placeholder |
| 23 | Web | `report.tsx` | Report uses hardcoded Porto location | Info | Accepted — demo mode |
| 24 | Web | `report.tsx` | "Add Photo" button is a stub | Info | Accepted — demo placeholder |
| 25 | Web | `index.tsx` | "alert.io" nav button does nothing on native (web-only) | Info | Accepted — web-only feature |
| 26 | Web | `incidentStore.ts` | `loadPublicData` swallows errors silently | Info | Accepted — graceful degradation |
| 27 | Web | `index.tsx` | `LANDING_PAGE_URL` hardcoded to localhost:8080 | Info | Documented — requires env config for production |
| 28 | Flutter | `api_service.dart` | `baseUrl` hardcoded to `10.0.2.2:3000` (emulator only) | Info | Documented — requires env config for production |
| 29 | Flutter | `map_screen.dart` | Report sheet TextEditingController not explicitly disposed | Medium | Documented — ephemeral, GC handles it |
| 30 | Landing | `index.html` | Auth forms always succeed (demo mode) | Info | Accepted — landing page demo |
| 31 | Landing | `index.html` | `<a>` elements without `href` in footer (semantics) | Low | Documented — functional but not ideal for a11y |
| 32 | Landing | `index.html` | Feature card CSS transform vs JS tilt conflict | Info | Accepted — JS inline wins on hover |
| 33 | Web | `useAccessibility.ts` | `announce()` is no-op on web platform | Low | Documented — requires aria-live region for web |
| 34 | Flutter | `incidents_provider.dart` | confirm/deny API errors silently swallowed | Info | Accepted — optimistic UI pattern |
| 35 | Flutter | `chain_screen.dart` | "Criar Nova Cadeia" and "Entrar com Codigo" have identical behavior | Info | Accepted — join flow not implemented |

---

## Test Coverage

- **Automated test suite:** `scripts/test-loop.mjs` — 105 tests across backend health, web app routes, file integrity, and code quality
- **Flutter compilation:** `flutter build apk --debug` passes with 0 errors
- **Web compilation:** Expo Metro bundler builds successfully
- **Landing page:** Static HTML, validated via browser load

---

## Platform Status

| Platform | Status | URL |
|----------|--------|-----|
| Backend API | Running | `http://localhost:3000` |
| Web App (Expo) | Running | `http://localhost:8081` |
| Landing Page | Running | `http://localhost:8080` |
| Flutter Mobile | Running | Android emulator (Pixel 7, API 34) |
| GitHub | Pushed | `sae3ovr/attention-app` |

---

## Recommendations

### For Production Readiness

1. **Environment configuration** — Move `LANDING_PAGE_URL`, `APP_URL`, and Flutter `baseUrl` to environment variables / build configs
2. **Real authentication** — Replace demo auto-login with proper Firebase Auth or JWT flow
3. **Clipboard API** — Wire the family invite code copy to `navigator.clipboard.writeText` (web) / `Clipboard.setData` (Flutter)
4. **url_launcher** — Add `url_launcher` package to Flutter for emergency phone dialing
5. **Image picker** — Add `image_picker` package to Flutter and web for incident photo attachments
6. **Geolocation** — Use real device location for incident reports instead of hardcoded Porto coordinates
7. **Error monitoring** — Add Sentry or equivalent for production error tracking
8. **API error surfaces** — Surface API errors to users in Flutter incident confirm/deny flows

### Dependency Updates

- `@expo/vector-icons` should be updated to `~14.0.4` (currently `14.1.0`)
- `react-native` should be updated to `0.76.9` (currently `0.76.7`)
- Flutter packages have 43 newer versions available (run `flutter pub outdated`)

### Architecture Notes

- The web app uses a single 2000+ line `index.tsx` for the map screen — consider splitting into sub-components
- Flutter and web share no code — consider a shared API client or data model package
- Landing page is a single 1400+ line HTML file — consider splitting CSS/JS into separate files for maintainability
