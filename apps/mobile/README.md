# Raidwell — Android and iOS

Version 0.4.0. A React Native application with native Android and iOS projects.
All screens use native React Native components. There is no hosted-page wrapper.
The project is self-contained: domain code, catalogue and artwork are included.

## Try it on your iPhone with Xcode

Unzip this project and open a Terminal in this directory:

```sh
npm ci
npx pod-install ios
open ios/Raidwell.xcworkspace
```

In Xcode, choose the **Raidwell** scheme and your connected iPhone. Under the
Raidwell target's **Signing & Capabilities**, select your development team and
let Xcode manage signing. The preview uses only local notifications and does not request the paid APNs push-notification entitlement. A personal Apple ID can be used for local development,
subject to Apple's provisioning limits. Change the bundle identifier if Xcode
requires a unique one.

For the default Debug configuration, keep this command running in the same folder:

```sh
npx expo start --dev-client
```

Press Run in Xcode. Your phone needs Developer Mode and must trust your development
certificate if iOS asks. Use a current Xcode version compatible with Expo SDK 58
and React Native 0.88. CocoaPods and the iOS native module have not been compiled
in the Linux build environment.

To run without a Metro server, edit the scheme's Run action to use **Release**.
The Xcode build phase embeds the JavaScript bundle and artwork in that build.
For a simulator, choose an installed simulator as the destination instead.

## Android

With Android Studio, a full JDK 21 (including `javac`), and the Android SDK/NDK installed:

```sh
npm ci
npm run android
```

That creates a development build. For a standalone ARM64 preview APK:

```sh
npm run android:apk
```

Output: `android/app/build/outputs/apk/release/app-release.apk`.
This preview uses the generated development signing key. It is not a Play Store
release key. Configure your own signing before distribution. Build all supported
architectures by dropping the `reactNativeArchitectures` command-line property.

`eas.json` also includes development, APK preview, iOS simulator and production
profiles. No Expo account, Apple distribution account or store submission is
configured by this project. Native OCR requires a native build; Expo Go is not
sufficient.

## Included

- Trainer onboarding, exact name/friend code validation, team and level.
- Raid discovery, search, tier filters, persisted favourites and preparation guides.
- Three-step hosting with screenshot selection, name/form/timer correction,
  group size, ready minimum, local players, weather and gym team.
- On-device OCR: a local Kotlin module using bundled Google ML Kit on Android,
  and a local Swift module using Apple Vision on iOS. No screenshot upload.
- Native room dashboard, guest readiness, individual replacement, smaller-ready
  roster confirmation, invitation batches, messages and a room timeline.
- Local session persistence; expiry is checked after cold start and foreground
  return. A queue keeps its existing position on resume.
- Local deadline notifications, notification permission diagnostics, a test alert,
  notification navigation, native share sheet, clipboard and optional haptics.
- Raid history, issue reports, saved context/corrections, export and local deletion.

## What the preview does not do yet

Other players, raid availability and demand are **simulated**. The app has no
shared matchmaking server, accounts, live room links, remote push delivery or
moderation team. A report is saved on the device, not submitted. The boss list is
a sample catalogue, not a dated current-event feed. In-game actions remain manual.
OCR reads English/Latin text; it does not identify a boss from its artwork. Its
accuracy on real screenshots and native compatibility still need device testing.

## Checks

```sh
npm test
npm run typecheck
npm run lint
```

`tests/` covers roster and invitation rules, OCR parsing and form handling,
restoration/expiry, profile validation, favourites, bounded messages and report
history. Native UI, permissions, OS background handling and Swift compilation
need separate device/Xcode checks. See `BUILD_STATUS.md` for build evidence.

Generated `ios/` and `android/` source are included for direct IDE use. Native
configuration belongs in `app.json` and `modules/raidwell-ocr/`; regenerating with
`npm run prebuild` can overwrite changes made only inside generated projects.
