<h1 align="center">
  VDS Verify<br />
</h1>
<p align="center"><a href="https://vds-verify.stelau.com"> 
<img src="https://img.shields.io/badge/HOMEPAGE-gray?style=for-the-badge"></a>&nbsp;</p>

Visible Digital Seal Reader is an app that allows you to read and verify the information contained in a VDS (Visible Digital Seal). It sends the QR code or datamatrix to our API to read, decode, verify the information and display it in a human readable format.
Scan history can be stored locally on the device when history is enabled.

It can decode:

- VDS/CEV according to the [ISO 22376:2023](https://www.iso.org/fr/standard/50278.html)
- VDS/CEV according to the [AFNOR xp-z42105](https://www.boutique.afnor.org/fr-fr/norme/xp-z42105/specifications-relatives-a-la-mise-en-oeuvre-du-cachet-electronique-visible/fa199910/238577) specification
- 2D-DOC according to the [ANTS 2D-DOC](https://ants.gouv.fr/nos-missions/les-solutions-numeriques/2d-doc) specification

The App works on iOS and Android and is built using [Expo](https://expo.dev/). It uses our VDS Verify API hosted on [Clever Cloud](https://www.clever-cloud.com) in Paris, France to decode and verify the VDS.

## Setup

The project currently targets Expo SDK 58 preview and React Native 0.88 RC.
Use the versions declared in `package.json`. **Expo Go is not supported**;
local development requires a development build with `expo-dev-client`.

### Prerequisites

- Node.js and npm compatible with the dependencies in `package.json`.
- For iOS: macOS, Xcode with the required simulator runtime, and CocoaPods.
  See the iOS 27 / Duo notes below for selecting Xcode 27.1.
- For Android: Android Studio, an installed Android SDK, a configured JDK,
  and a running emulator or connected development device.
- Maestro CLI and Java are needed only for automated screenshots.

### Install dependencies

From the project root:

```sh
npm_config_legacy_peer_deps=true npm install
```

The peer-dependency option is used for this project's prerelease dependency stack.
Installation also runs `scripts/fix-expo-modules-jsi.cjs` through `postinstall`.
The native `ios/` and `android/` directories are generated and ignored by Git;
keep persistent native configuration in the Expo config and config plugins.

### Configure the API

Create a `.env` file at the project root:

```dotenv
EXPO_PUBLIC_VDS_API_URL=https://api.vds-verify.stelau.com
```

Use your own server URL if needed. A physical device must be able to reach that
address; `localhost` on a device does not point to your development computer.
This variable is embedded in the client bundle, so it must not contain secrets.
`.env` is ignored by Git. Restart Metro after changing it.

### Run in development

Boot the target simulator/emulator, then run one of:

```sh
npm run ios
npm run android
```

These scripts use `@expo/agent-cli` to prepare and launch the development app.
They force `VDS_SCREENSHOTS=0` and stop the shared development server before
preparation, including when returning from a screenshot build.

To inspect the plan without stopping the server or building:

```sh
npm run ios -- --plan
npm run android -- --plan
```

Once the normal development build is installed, `npm start` starts only Metro.
It does not regenerate the native project or replace a capture binary.
Open **History → Seed** to load the examples from `src/testdata.ts`. Seed is
available only in development builds outside screenshot mode.

### Checks and dependency maintenance

```sh
npx @expo/agent-cli typecheck
npx @expo/agent-cli lint
npx @expo/agent-cli doctor
```

Dependency repair is a maintenance operation, not a step to run on every launch:

```sh
npm_config_legacy_peer_deps=true npx @expo/agent-cli install --fix
```

Review dependency changes before building. Add Expo packages with
`npx @expo/agent-cli install <package>` to use SDK-compatible version resolution.
`npm run format` rewrites source formatting; use it deliberately.

## Build and submit with EAS

EAS builds require an Expo account and the appropriate signing/store credentials.
The profiles are defined in `eas.json`: `development` includes the dev client,
`preview` is for internal distribution, and `production` is for store builds.
Check the API URL for the selected profile; the development profile currently
contains a local-network server address that may need updating.

Build and submit the normal app, with capture mode disabled:

```sh
VDS_SCREENSHOTS=0 npx eas-cli build --platform ios --profile production
VDS_SCREENSHOTS=0 npx eas-cli build --platform android --profile production
VDS_SCREENSHOTS=0 npx eas-cli submit --platform ios --profile production
VDS_SCREENSHOTS=0 npx eas-cli submit --platform android --profile production
```

Keep `VDS_SCREENSHOTS=1` out of EAS build environments. The dedicated Maestro
capture binary is for local screenshots only and must not be submitted.

# ⚠️ License

`VDS Verify` is free and open-source software licensed under the [Apache 2.0 License](https://github.com/stelauconseil/vds-verify/blob/main/LICENSE).

## iOS 27 and iPhone Duo

The app uses Expo SDK 58 beta / React Native 0.88 RC. SDK 58 generates the
scene-based iOS lifecycle required by Xcode 27. Keep `ios/` generated through
Expo prebuild; do not add a second scene manifest or raise the minimum OS to 27.

For a fresh installation during this beta, npm's prerelease peer resolution
requires `npm_config_legacy_peer_deps=true npm install`. Package additions must
still use `@expo/agent-cli install` for SDK-compatible version selection.

```sh
npx @expo/agent-cli typecheck
npx @expo/agent-cli doctor
npx @expo/agent-cli smoke --ios
```

Use Xcode 27 for iOS 27. Full Duo screen usage requires building with the iOS
27.1 SDK and validating with the corresponding Duo simulator in Device Hub.
Check the available EAS build images before a cloud build; no unverified Xcode
27.1 image is pinned in `eas.json`.

Running a 27.1 simulator alone is insufficient: an app built with the 27.0 SDK
retains the black side strip and horizontal bars. Select Xcode 27.1 for the build
without changing the global Xcode selection (adjust the path if necessary):

```sh
DEVELOPER_DIR="$HOME/Downloads/Xcode.app/Contents/Developer" npm run ios
```

The `postinstall` workaround for ExpoModulesJSI 58.0.2 preserves this Xcode
selection in its nested build and handles the Swift C++ interface cleanup.

Before release, test closed/open/partially folded poses, rotation, and window
resizing. Keep a scan result open during resizing; check the scanner guide,
flashlight, result close/share controls, image preview, Settings at large text
sizes, history swipe/delete, and JSON/PDF sharing. Test actual barcode capture
on a physical device. Type checking alone does not validate native behavior.

References: [Expo SDK 58 beta](https://expo.dev/changelog/sdk-58-beta),
[Apple's Duo preparation guide](https://developer.apple.com/videos/play/tech-talks/111461/).

## Automated store screenshots (local Maestro)

This workflow uses **Maestro CLI locally**, with no Cloud account or paid service.
Install it from https://docs.maestro.dev/ and have Java 17+ available. The runner
also finds `~/.maestro/bin/maestro` without changing your shell PATH and disables
Maestro analytics. Validated CLI version: 2.10.0.

The capture app has its own ID, `com.stelau.vdsverify.screenshots`, and scheme,
`vdsverify-screenshots`. It cannot overwrite the normal app's history. Its setup
route seeds the examples in `src/testdata.ts`, with fixed history dates,
and sets the language and theme without calling the verification API. The normal
app rejects this route. Original example fields, including test-data markers and
verification status, are preserved.

Boot a simulator/emulator first. Build a dedicated **Release** app to avoid the
Expo developer menu in screenshots (the build helper first uses agent-cli to
prepare the native project, then compiles the Release binary). This stops and
restarts the project’s shared development server during preparation:

```sh
# Find the booted iOS simulator UUID.
xcrun simctl list devices booted
export IOS_DEVICE="<simulator UUID>"
export DEVELOPER_DIR="$HOME/Downloads/Xcode.app/Contents/Developer"
npm run screenshots:build:ios
npm run screenshots:ios

# Start an Android emulator, then find its ID with adb devices.
export ANDROID_DEVICE="emulator-5554"
npm run screenshots:build:android
npm run screenshots:android
```

`npm run screenshots:all` captures both already-installed apps. Each run generates
five screenshots (history, identity, details, driving record, settings), for French
and English, in light and dark themes: 20 images per device. To run a smaller set:

```sh
SCREENSHOT_LANGUAGES=fr SCREENSHOT_THEMES=light npm run screenshots:ios
```

Output: `build/screenshots/<platform>/<device>/<run>/`. Open `index.html` for the
review gallery; `manifest.json` records each PNG's dimensions. Raw screenshots
are not stretched or cropped. Choose simulator dimensions accepted by the target
store; the gallery is for review, not an assertion of store acceptance. No assets
are uploaded. iOS status-bar overrides are cleared after the run. Android is temporarily set
to portrait, then its rotation settings are restored. Keep simulator font size
and timezone stable across repeated runs. The runner opens the setup route with
native simulator commands; Maestro then opens results from history, checks the
visible screens, switches to Details, and saves the PNGs.

Use an iPhone Pro Max and iPad for Apple assets and a phone/tablet emulator for
Google Play. Duo/multi-display capture needs separate verification of Maestro's
active-display selection. Camera screenshots are not part of this first flow;
a realistic camera source still needs to be configured.

The helper regenerates the ignored native project with the capture identifier.
Before returning to regular development, run `npm run ios` or `npm run android`
to disable capture mode and prepare the normal app identity.
Never distribute or submit the dedicated capture binary.

### Return to development and Seed

Run `npm run ios` or `npm run android` to prepare and launch the normal development
app. These commands explicitly disable capture mode, even if `VDS_SCREENSHOTS=1`
is set in the shell or `.env`, and restart the shared development server before
native preparation. The **Seed** button is available in History in this build.

`npm start` starts only Metro in normal mode; it does not rebuild or replace an
installed capture binary. Use `npm run ios -- --plan` (or Android) to inspect the
preparation plan without stopping the server. The `screenshots:*` commands remain
reserved for the separate capture app.

If Seed is missing, ensure you opened the development app, not the Release capture
app. The dev scripts explicitly launch the `vdsverify` scheme: older capture
builds also register `exp+vds-verify`, which can open the wrong app. New capture
builds use a separate slug to avoid registering the shared development scheme.
