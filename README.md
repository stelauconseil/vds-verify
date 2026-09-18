<h1 align="center">
  VDS Verify<br />
</h1>
<p align="center"><a href="https://vds-verify.stelau.com"> 
<img src="https://img.shields.io/badge/HOMEPAGE-gray?style=for-the-badge"></a>&nbsp;</p>

Visible Digital Seal Reader is an app that allows you to read and verify the information contained in a VDS (Visible Digital Seal). It sends the QR code or datamatrix to our API to read, decode, verify the information and display it in a human readable format.
Data is not stored in any way, not even temporarily.

It can decode:

- VDS/CEV according to the [ISO 22376:2023](https://www.iso.org/fr/standard/50278.html)
- VDS/CEV according to the [AFNOR xp-z42105](https://www.boutique.afnor.org/fr-fr/norme/xp-z42105/specifications-relatives-a-la-mise-en-oeuvre-du-cachet-electronique-visible/fa199910/238577) specification
- 2D-DOC according to the [ANTS 2D-DOC](https://ants.gouv.fr/nos-missions/les-solutions-numeriques/2d-doc) specification

The App works on iOS and Android and is built using [Expo](https://expo.dev/). It uses our VDS Verify API hosted on [Clever Cloud](https://www.clever-cloud.com) in Paris, France to decode and verify the VDS.

# ⚙️ Setup

Update the API URL (environment variable) to point to the VDS verify server.

# ✍️ To start

```sh
npx expo install --fix
npx expo start
```

# To build

```sh
eas build --platform ios
eas build --platform android
eas submit
```

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

Before release, test closed/open/partially folded poses, rotation, and window
resizing. Keep a scan result open during resizing; check the scanner guide,
flashlight, result close/share controls, image preview, Settings at large text
sizes, history swipe/delete, and JSON/PDF sharing. Test actual barcode capture
on a physical device. Type checking alone does not validate native behavior.

References: [Expo SDK 58 beta](https://expo.dev/changelog/sdk-58-beta),
[Apple's Duo preparation guide](https://developer.apple.com/videos/play/tech-talks/111461/).
