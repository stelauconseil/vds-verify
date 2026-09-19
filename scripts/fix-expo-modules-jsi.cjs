const fs = require("node:fs");
const path = require("node:path");

// Android builds do not execute this Apple-only build phase.
if (process.platform !== "darwin") process.exit(0);

const packagePath = require.resolve("expo-modules-jsi/package.json");
const { version } = JSON.parse(fs.readFileSync(packagePath, "utf8"));

// Temporary workarounds for this version with Xcode 27.0/27.1.
// Reassess after upgrading Expo rather than patching an unknown build script.
if (version !== "58.0.2") {
    console.warn(`[ExpoModulesJSI] Version ${version}: recheck the Xcode quiet-mode workaround.`);
    process.exit(0);
}

const scriptPath = path.join(path.dirname(packagePath), "apple/scripts/build-xcframework.sh");
const source = fs.readFileSync(scriptPath, "utf8");
const quietFlag = "    -quiet \\\n";

// A nested `xcodebuild -quiet` can report a SwiftCompile error despite exiting
// successfully and producing the framework. The parent archive treats that
// diagnostic as fatal. Keep full output and all real compiler errors intact.
let patched = source.replace(quietFlag, "");
// Swift interfaces can spell C++ namespace separators as `::` instead of `.`.
// Extend Expo's existing removal of unimportable C++ extension blocks.
patched = patched.replace('/^extension __ObjC\\./', '/^extension __ObjC[.:]/');
// The nested build clears its environment. Preserve an explicitly selected
// Xcode so it uses the same SDK/compiler as the parent build.
patched = patched.replace(
    'env -i PATH="$PATH" HOME="$HOME" PODS_ROOT=',
    'env -i PATH="$PATH" HOME="$HOME" DEVELOPER_DIR="${DEVELOPER_DIR:-$(xcode-select -p)}" PODS_ROOT=',
);
if (patched !== source) {
    fs.writeFileSync(scriptPath, patched);
    console.log("[ExpoModulesJSI] Applied Xcode 27 build compatibility fixes.");
}
