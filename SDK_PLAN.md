# On-device CEV/VDS SDK integration plan

## Objective

Replace the request to `POST /api/v1/decode` with local decoding and signature verification on Android and iOS. The QR scanner, result screen, history, and `VdsResult` TypeScript model should continue to work through one platform-neutral JavaScript interface.

The supplied libraries are not currently one Kotlin Multiplatform (KMP) SDK:

- Android is a Kotlin/JVM library distributed as `cev.jar`.
- iOS is a native Swift Package named `DecodeCev`.

The integration should therefore use a shared TypeScript contract backed by one native implementation per platform. Converting both libraries into a true KMP library would be a separate, substantially larger project.

## Current application flow

The scan handler is in `src/app/(tabs)/index.tsx`:

1. `expo-camera` returns the QR/Data Matrix content as a string.
2. `parseData()` transforms that content into Base64.
3. The app sends `{ vds: <base64> }` to `${EXPO_PUBLIC_VDS_API_URL}/api/v1/decode`.
4. The API response is normalized with `normalizeVdsResult()`.
5. The normalized result is displayed and optionally stored in scan history.

The native SDKs expect the original CEV/VDS bytes or encoded QR text. The Base64 conversion is part of the current API protocol and must not be applied blindly before calling the SDKs.

## Target architecture

```text
expo-camera / deep link
          |
          v
normalize raw scan input
          |
          v
src/native/VdsDecoder.ts
          |
          +-- Android Expo module --> cev.jar
          |
          +-- iOS Expo module -----> DecodeCev Swift Package
          |
          v
common NativeDecodeResponse
          |
          v
normalizeVdsResult() --> result screen and history
```

The JavaScript API should be identical on both platforms:

```ts
export interface NativeDecodeResponse {
    success: boolean;
    message?: string;
    errorCode?: number;
    vds?: VdsResult;
}

export function decodeVds(rawData: string): Promise<NativeDecodeResponse>;
```

Use one local Expo module, tentatively named `VdsDecoder`, with Android and iOS implementations. Expo Go cannot load this module; development builds, `expo run:android`, `expo run:ios`, or EAS builds are required.

## Source dependencies

### Android

Source project:

```text
/Users/nicocha/Projects/FIN/ft/ft2u/france-identite-app/
  france-identite-android/Libs/cev
```

Current built artifact:

```text
cev/build/libs/cev.jar
```

Public API:

```kotlin
val cev = Cev.create()
val document = cev.decode(rawData.toByteArray(Charsets.UTF_8))
```

The Android SDK requires API 26 or newer and these runtime dependencies:

```gradle
implementation files("libs/cev.jar")
implementation "fr.gouv.franceidentite.libs:commons-codec:1.17.0"
implementation "org.msgpack:msgpack-core:0.9.12"
implementation "io.github.ehn-digital-green-development:base45:0.0.3"
implementation "org.bouncycastle:bcprov-jdk18on:1.84"
implementation "org.bouncycastle:bcpkix-jdk18on:1.84"
```

R8/ProGuard rules:

```proguard
-dontwarn org.msgpack.**
-keep class org.msgpack.** { *; }
```

### iOS

Source package:

```text
/Users/nicocha/Projects/FIN/ft/ft2u/france-identite-app/
  france-identite-ios/libs/decode-cev
```

Public API:

```swift
import DecodeCev

let cev = Cev()
let document = try cev.decode(Data(rawData.utf8))
```

The package requires iOS 16 and depends on:

- MessagePack.swift
- SWXMLHash
- swift-certificates
- Base32
- base45-swift

## Repository layout

Vendor versioned SDK artifacts or source code inside this repository. Absolute paths under `/Users/nicocha/Projects/FIN` work only on the current machine and will fail in CI and EAS cloud builds.

Suggested layout:

```text
modules/vds-decoder/
  expo-module.config.json
  index.ts
  src/VdsDecoder.types.ts
  android/
    build.gradle
    libs/cev.jar
    src/main/java/com/stelau/vdsdecoder/VdsDecoderModule.kt
  ios/
    VdsDecoderModule.swift
    VdsDecoder.podspec
  vendor/ios/decode-cev/
    Package.swift
    Sources/DecodeCev/...
```

Before vendoring, confirm the SDK licences and whether modified source or binary artifacts may be redistributed in the application repository and mobile binaries.

## Common result mapping

Both native `Document` types expose the same conceptual values:

| Native value | `VdsResult` value |
| --- | --- |
| `document.information` | `data` |
| `document.header` | `header` |
| `document.extensions` | optional `extensions` |
| `DOC_101` | `vds_standard: "DOC_101"` |
| `DOC_105` | `vds_standard: "DOC_105"` |
| `DOC_ISO` | `vds_standard: "DOC_ISO22376_2023"` |
| successful verified decode | `sign_is_valid: true` |

`VdsResult` currently does not declare `extensions`. Either add it as an optional data record or deliberately merge/omit it after comparing it with the API response format.

The result must contain only values that can cross the React Native bridge: strings, numbers, booleans, nulls, arrays, and string-keyed maps. Native dates, byte arrays, enums, certificates, and other objects must be converted explicitly. Recommended conversions are:

- `ByteArray`/`Data`: Base64 string.
- date/time objects: ISO 8601 string or epoch number, matching the existing API.
- enum values: stable strings.
- map keys: strings.

## Android native implementation

Create an Expo Kotlin module named `VdsDecoder` with an asynchronous `decode(rawData)` function.

The implementation should:

1. Initialize and retain one `Cev` instance with `Cev.create()`.
2. Convert the normalized raw scan string to UTF-8 bytes.
3. Call the suspend function `cev.decode(bytes)` off the JavaScript thread.
4. Convert `Document` recursively into bridge-safe values.
5. Return the common `NativeDecodeResponse` shape.
6. Catch `Cev.Exception` and expose `exception.code.value` as `errorCode`.

Android SDK 2.2.4 provides `decodeWithoutValidation()`. To preserve the app's current ability to display invalid or unsigned content:

1. Attempt `decode()` first.
2. On signature or certificate validation errors, attempt `decodeWithoutValidation()`.
3. If fallback decoding succeeds, return its data with `sign_is_valid: false` and the original validation error code.
4. Do not use fallback for malformed or unsupported input unless product requirements explicitly permit displaying unverified parse results.

The SDK recognizes CEV/VDS prefixes and supports 2D-Doc, AFNOR 101/105, ISO 22376, and nested VDS according to its configuration and available resources.

## iOS native implementation

Create the corresponding Expo Swift module with the same module and function names. It should:

1. Initialize and retain `Cev()`.
2. call `cev.decode(Data(rawData.utf8))` asynchronously.
3. Convert the Swift `Document` into bridge-safe dictionaries and arrays.
4. Return exactly the same keys and standard identifiers as Android.

The inspected iOS SDK is behind Android in three relevant areas:

### Missing validation-free decoding

There is no `decodeWithoutValidation()` method. A signature failure therefore produces an error without a decoded document. Until parity is added, iOS cannot produce the same invalid-document result as Android.

Add a public method equivalent to Android's:

```swift
public func decodeWithoutValidation(_ code: Data) throws -> Document
```

Internal decode functions should accept a `verifySignature` flag so that parsing behavior remains shared and verification is skipped only when explicitly requested.

### Error information is not public

`CevError` is public, but its `code`, `msg`, `cause`, and `SdkErrorCode` are not public. Make the error code and message publicly readable so the bridge can distinguish malformed input, missing resources, and invalid signatures.

### Prefix behavior differs

Android strips supported IAC/code-format prefixes before decoding. The inspected iOS implementation does not contain the same prefix extraction. Port the Android prefix logic or normalize this input consistently in the TypeScript/native wrapper, backed by cross-platform tests.

## Input normalization

Keep input normalization separate from native document decoding.

Supported application inputs currently include:

- direct QR/Data Matrix text;
- `https://.../vds#<payload>` links;
- `vds...` deep links;
- potentially binary data represented by the scanner as a string.

Define fixtures for each supported wrapper and determine the exact original bytes expected by both SDKs. Replace the API-specific `parseData()` function with something such as:

```ts
function extractRawVdsData(scannedData: string): string | null;
```

Do not automatically Base64-encode direct scanner content. For link payloads, decode according to the link format and pass the reconstructed original CEV/VDS text to the native module.

The SDK README also describes `mdoc:` device engagement containing CEV data. That preprocessing is not implemented consistently by the SDK entry points and should be treated as an explicit input-normalization feature with dedicated tests.

## Certificates, manifests, and keys

Both SDKs contain a limited default set of France Identité manifests and certificates. Supporting other issuers requires a custom resource provider.

Create a resource inventory before removing the API:

1. List all document and issuer types currently accepted by production.
2. Compare that list with resources bundled in each SDK.
3. Bundle the same production manifests and public certificates on both platforms.
4. Define a safe update strategy for expiring or newly issued certificates.
5. Never bundle private signing or decryption keys unless nested VDS requirements explicitly require device-held keys and their storage model has been reviewed.

If app-provided resources are used, note that each SDK replaces rather than supplements its default resource provider. The custom provider must therefore cover every required default and additional resource.

## Application changes

After the native module is available:

1. Add `src/native/VdsDecoder.ts` as the typed wrapper around `requireNativeModule("VdsDecoder")`.
2. Replace the `fetch()` block in `src/app/(tabs)/index.tsx` with `decodeVds(rawData)`.
3. Keep `normalizeVdsResult()` as a defensive boundary.
4. Preserve haptics, history storage, navigation, preview capture, duplicate-scan protection, and localized error display.
5. Map stable SDK error codes to translation keys instead of displaying implementation messages directly.
6. Remove `EXPO_PUBLIC_VDS_API_URL` only after both native platforms pass acceptance tests.
7. Update the privacy policy and README to state that decoding and verification occur locally.

During migration, an optional feature flag may select native decoding or the API. Do not silently fall back to the API if the product promise is offline/private decoding; fallback behavior must be explicit and observable.

## Error mapping

Define shared application error names for native error codes. At minimum:

| SDK code | Meaning | Suggested app key |
| --- | --- | --- |
| 10 | generic error | `error` |
| 11 | decoding failure | `error_invalid_qr` |
| 13 | invalid signature | `error_invalid_signature` |
| 14 | invalid static nested signature | `error_invalid_signature` |
| 15 | invalid dynamic nested signature | `error_invalid_signature` |
| 17 | nested VDS decoding failure | `error_invalid_qr` |
| 20 | nested VDS expired | `error_expired` |
| 22 | certificate missing (Android) | `error_certificate_missing` |
| 23 | certificate expired (Android) | `error_certificate_expired` |
| 24 | certificate not yet valid (Android) | `error_certificate_not_valid` |
| 25 | manifest missing (Android) | `error_manifest_missing` |
| 26 | invalid hash signature (Android) | `error_invalid_signature` |

Bring the iOS error taxonomy into parity with Android where the same conditions can occur.

## Testing strategy

Use identical, non-sensitive scan fixtures on Android, iOS, and the existing API during migration.

Test at least:

- valid DOC_101/2D-Doc;
- valid DOC_105;
- valid ISO 22376;
- invalid signature with otherwise decodable data;
- missing certificate;
- missing manifest;
- expired/not-yet-valid certificate;
- corrupted and truncated payloads;
- direct QR text and each supported deep-link wrapper;
- Base16, Base32, Base45, and raw/binary representations used in production;
- nested VDS if the app supports it;
- arrays, nested objects, binary fields, timestamps, and null values;
- release builds with R8 enabled on Android;
- offline airplane-mode operation;
- history serialization and reopening saved results.

Compare normalized JSON rather than native object descriptions. Android and iOS must emit the same key naming, scalar formats, standard identifiers, verification semantics, and error categories.

## Build and release considerations

- Set Android `minSdkVersion` to at least 26.
- Set the iOS deployment target to at least 16.
- Ensure all native SDK code, resources, and package dependencies are reproducible in EAS Build.
- Pin dependency versions and record the Android and iOS SDK source revisions.
- Confirm that Swift Package dependencies integrate correctly with the CocoaPods-based Expo project; if necessary, expose the vendored Swift sources through the local Expo module rather than relying on an absolute local package reference.
- Build and test both debug and release variants.
- Measure application-size growth and decode latency.
- Add an SDK-resource/version value to diagnostics so production results can be traced to the decoder and trust-data version without logging scanned personal data.
- Do not log raw QR values, decoded identity information, certificates tied to a scan, or bridge payloads.

## Implementation phases

### Phase 1: contract and fixtures

- Inventory current API response shapes and supported documents.
- Collect sanitized fixtures and expected normalized JSON.
- Finalize input extraction, result mapping, and error semantics.
- Decide whether `extensions` becomes part of `VdsResult`.

### Phase 2: Android

- Create the local Expo module.
- Vendor the JAR and declare its dependencies.
- Implement verified decode and validation-free fallback.
- Add R8 rules and set API 26 minimum.
- Run Android fixture and release-build tests.

### Phase 3: iOS parity and integration

- Update the Swift SDK with public errors, validation-free decoding, and matching prefix handling.
- Vendor the package/source and integrate its dependencies.
- Implement the Swift Expo module and bridge-safe conversion.
- Run iOS fixture and release-build tests.

### Phase 4: application cutover

- Replace the API call with the typed native wrapper.
- Add localized native error mappings.
- Verify scan, deep-link, result, and history flows on physical devices.
- Test fully offline.

### Phase 5: production readiness

- Complete the certificate/manifest coverage audit.
- Confirm licences and security/privacy review.
- Remove the API environment variable and obsolete Base64 request code.
- Update documentation and policies.
- Roll out with decoder/resource version diagnostics and crash monitoring that excludes personal data.

## Acceptance criteria

The API can be removed when:

- Android and iOS decode every supported production fixture locally.
- Both platforms produce equivalent normalized `VdsResult` objects.
- Signature validity and validation failures have deliberate, consistent UI behavior.
- Required certificates and manifests are available offline on both platforms.
- Direct scans and deep links behave identically to the existing app.
- Debug and release builds pass on physical Android and iOS devices.
- No scan or decoded identity data leaves the device during decoding.
- EAS builds are reproducible without machine-specific absolute paths.
