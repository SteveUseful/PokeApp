# Build status — Raidwell 0.4.0

## Android preview APK: compiled and signed

- Built the Gradle release variant for ARM64 (`arm64-v8a`).
- Package: `app.raidwell.mobile`; version name `0.4.0`; version code `4`.
- Minimum Android API 24; target API 36; compile API 37.
- The APK contains the Hermes app bundle, artwork and native libraries; a Metro
  server and Expo Go are not needed for this Android preview.
- The local Kotlin RaidwellOCR module compiled successfully with bundled ML Kit.
- APK signature verified with Android SDK `apksigner`.
- Signing uses the generated Android development key. This is a device preview,
  not a Play Store submission.
- APK SHA-256: `f710a246f92aca3e01c34a46275cec01875cb2287f73694171641da9481b51c3`.

The cloud build used JDK 21 and a two-job native compiler limit. Official Maven
artifacts were locally cached to work around download failures. Android's
`lintVitalAnalyzeRelease`, `lintVitalReportRelease` and `lintVitalRelease` were
excluded from this preview package after native compilation. That release-lint
pass is **not verified**. TypeScript and JavaScript lint checks passed separately.

## iOS: native source prepared, not compiled here

- Includes the generated Xcode project, Podfile and Swift Apple Vision OCR module.
- The local OCR module is included by iOS autolinking.
- APNs entitlements are disabled; this preview uses local notifications only.
- iOS Hermes JavaScript bundle export passed.
- CocoaPods resolution, Swift compilation, signing and iPhone/simulator execution
  require Xcode and were not performed in this Linux workspace.
- No IPA or TestFlight build is claimed. Follow README.md on your Mac.

## Shared checks

- 28 domain/lifecycle/report tests passed.
- TypeScript checking passed.
- ESLint passed with no errors or warnings.
- Hermes JavaScript bundle exports passed for both Android and iOS.
- Native source inventory and embedded asset paths were checked; the project
  has no dependency on the website files.

Neither platform has been tested on a physical phone in this session. Other
players, queues and raid availability are simulated. The multiplayer service,
remote push delivery and server-side moderation are not connected.
