const fs = require("node:fs");
const path = require("node:path");

// Android builds do not execute this Apple-only build phase.
if (process.platform !== "darwin") process.exit(0);

const packagePath = require.resolve("expo-modules-jsi/package.json");
const { version } = JSON.parse(fs.readFileSync(packagePath, "utf8"));

// Temporary workaround verified against this version with Xcode 27.0.
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
if (source.includes(quietFlag)) {
    fs.writeFileSync(scriptPath, source.replace(quietFlag, ""));
    console.log("[ExpoModulesJSI] Disabled nested xcodebuild quiet mode for Xcode 27.");
}
