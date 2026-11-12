# Production work checkpoint — 2026-11-11

## Passed

- 37 API tests: multiplayer contract, authentication, permissions, party/queue
  lifecycle, reconnect and missed updates, revoked sessions, private snapshots,
  rollback silence, frame/origin limits, constructor retry cleanup, backup
  restoration, blocking and account-data deletion.
- 33 mobile/domain Node tests through the mobile package's `npm test` command.
- Mobile TypeScript and Expo lint.
- Expo Android and iOS JavaScript/Hermes exports. These do not compile or sign
  Android/iOS native projects.
- Bundled API ran from an isolated directory without node_modules: health,
  deletion page and authenticated WebSocket connection.
- Railway deployment `7063909c-f2fa-47d5-80d0-7b06dc37c2d7` reached SUCCESS.
  `/health` reported build `f523d553bc40`. A disposable hosted account connected
  over authenticated WSS, deleted via the same-origin external deletion endpoint,
  and its prior bearer token returned 401. Test account was removed.
- 20-client loopback sample: all-client broadcast p50 40.9 ms / p95 54.0 ms;
  details and limitations in HOSTING.md.

No current user database, token, password or recovery key is included here.

## Still unverified

The existing downloadable APK remains version 0.5.0, built before this
checkpoint. No new APK/AAB/IPA has been compiled here. Full Android release lint,
16 KB native library/archive alignment, store signing, Xcode compilation,
physical phone/OS behavior, push delivery and screen-reader/adaptive UI checks
remain open. Maestro navigation flow is prepared, not executed.

The session is a Linux cloud workspace (10 GiB RAM), even when the chat is open
on a Windows PC. It has no connected Windows SDK, local emulator, or USB phone.
CI workflow source is present; no GitHub Actions run is implied by local checks.
No scheduled offsite backups, staffed moderation, alert/on-call service or final
public privacy policy has been configured.

## Reproduce

From the repository root, using Node 24 or newer:

```sh
npm ci --prefix services/api
npm ci --prefix apps/mobile
node scripts/preflight.mjs
node scripts/quality.mjs
node services/api/scripts/benchmark.mjs 20
node scripts/release-gate.mjs
```

The final command is expected to fail until all remaining release gates have
actual evidence. Run each mobile package command from its package directory;
one legacy fixture test resolves data from its working directory.

## Backend/UI follow-up

The current hosted build was rechecked after sleeping: health/readiness returned
200, the build hash matched, and encrypted backup health was good. Latest-scoped
runtime logs showed normal startup; earlier integrity failures belong to older
deployment attempts. Encrypted backup download/decrypt/integrity verification,
bounded password work, future-schema rejection and interrupted-write recovery
have test evidence. See OPERATIONS.md for recovery limitations and key custody.

UI_QA.md records the actual click-through results and navigation/UX fixes.
No new signed phone artifact has been produced by those browser checks.
