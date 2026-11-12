# Raidwell / PokeApp

Native Android and iOS raid coordination, with a shared multiplayer backend.
The mobile app is built with React Native, Expo SDK 58 and Expo Router; it is
not a WebView wrapper. This repository contains the complete current project,
including the earlier browser prototype as a labelled legacy reference.

## Project map

| Path | Purpose |
| --- | --- |
| `apps/mobile/` | Native app, Android Studio and Xcode projects, on-device OCR, profiles, friends, raids and parties |
| `services/api/` | Node 24 API, persistent SQLite database, authenticated WebSockets, encrypted backup/restore tools |
| `docs/production/` | Hosting budget, operations, validation evidence and remaining release gates |
| `scripts/` | Quality checks, environment preflight, local UI QA and backend packaging |
| `.github/workflows/quality.yml` | Automated API/mobile tests, TypeScript and lint |
| `dist/`, `tests/engine.test.cjs` | Earlier standalone browser simulation; see `docs/LEGACY_WEB_PROTOTYPE.md` |

## Install and verify

Use Node.js 24 or newer. From the repository root:

```sh
npm ci
npm ci --prefix services/api
npm ci --prefix apps/mobile
npm test
node scripts/preflight.mjs
```

The API can run with `npm --prefix services/api start`. It listens on port 8787
by default. Supply deployment settings through environment variables; see
`services/api/.env.example` and its README. Production needs persistent storage
at `DATABASE_PATH`, HTTPS, and a single replica for this SQLite implementation.
`/health` checks liveness; `/ready` checks the database and reports backup health.
Never commit production databases, credentials, backup ciphertexts or keys.

For Android development, install Android Studio/SDK and a full JDK, then run
`node scripts/prepare-android-debug-key.mjs` once and use `npx expo run:android`
from `apps/mobile`. Each checkout generates its own local development signing
key. Store releases require separate production signing. For iOS, open
`apps/mobile/ios/Raidwell.xcodeproj` on a Mac with Xcode after installing the
required CocoaPods dependencies, or configure the EAS profiles in
`apps/mobile/eas.json`. Windows cannot compile an Xcode archive locally.

The default mobile API URL is the existing hosted beta. Local development
endpoints need explicit development configuration; do not enable HTTP in a
public release.

## Current status

The backend is deployed on Railway with a persistent volume and verified,
encrypted backups in a private bucket. The free plan sleeps and has usage-credit
limits; it is not an unlimited or always-on public-launch promise.

Current source includes real multiplayer, ready checks, invitation batches,
party queueing, friends/presence/privacy, reporting, recovery, account export
and deletion. Screenshot OCR runs on-device (Android ML Kit / iOS Vision).
The last downloadable Android APK is 0.5.0 and predates the latest source/UI
changes. No current-source signed APK/AAB/IPA is implied by this repository.

Store signing, native-device QA, remote push credentials/delivery, operational
moderation, final privacy/support policies, artwork/brand rights review and
release approvals remain open. See `docs/production/VALIDATION.md` and
`docs/production/release-gates.json`; this is not a claim of store readiness.

The local browser QA harness is loopback-only and uses disposable in-memory
accounts. It is not deployed and is excluded from native app session code.
See `docs/production/UI_QA.md` for exactly what was exercised and what remains.
