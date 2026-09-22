import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

const platform = process.argv[2];
if (!["ios", "android"].includes(platform)) throw Error("Expected ios or android");
const device = process.env[platform === "ios" ? "IOS_DEVICE" : "ANDROID_DEVICE"];
if (!device || (platform === "android" && !/^emulator-\d+$/.test(device))) {
    throw Error(`Set ${platform === "ios" ? "IOS_DEVICE to a booted simulator UUID" : "ANDROID_DEVICE to a booted emulator ID"}`);
}
const env = { ...process.env, VDS_SCREENSHOTS: "1", npm_config_legacy_peer_deps: "true" };
function run(command, args) {
    const result = spawnSync(command, args, { env, stdio: "inherit" });
    if (result.error || result.status !== 0) throw Error(result.error?.message || `${command} failed`);
}
// A single agent-cli server is shared across platforms; stop it before planning
// so an existing iOS server cannot skip Android native preparation (or vice versa).
run("npx", ["@expo/agent-cli", "dev:stop"]);
// The project CLI owns CNG generation and dependency installation.
const preparation = spawnSync("npx", ["@expo/agent-cli", "dev", `--${platform}`, "--detach", "--wait-ready", "--port", "8088"], { env, encoding: "utf8" });
process.stdout.write(preparation.stdout || "");
process.stderr.write(preparation.stderr || "");
if (preparation.status !== 0) {
    const output = (preparation.stdout || "") + (preparation.stderr || "");
    if (!output.includes("--wait-ready gave up")) throw Error("Native preparation failed");
    // agent-cli keeps compiling after its short readiness timeout.
    const deadline = Date.now() + 30 * 60_000;
    let ready = false;
    while (Date.now() < deadline) {
        const log = readFileSync(".expo/dev/logs/dev-detached.log", "utf8");
        if (/CommandError:|BUILD FAILED|BUILD FAILED in/.test(log)) throw Error("Native build failed; see .expo/dev/logs/dev-detached.log");
        if (/Opening on |Opening .* on /.test(log)) { ready = true; break; }
        await new Promise(resolve => setTimeout(resolve, 5000));
    }
    if (!ready) throw Error("Native preparation timed out; inspect the agent-cli build log");
}
const nativeConfig = readFileSync(platform === "ios" ? "ios/VDSVerify.xcodeproj/project.pbxproj" : "android/app/build.gradle", "utf8");
if (!nativeConfig.includes("com.stelau.vdsverify.screenshots")) throw Error("Native project is not configured for screenshots; refusing to build the normal app");
mkdirSync("build/screenshots-binaries", { recursive: true });
if (platform === "ios") {
    const derived = path.resolve("build/screenshots-binaries/ios");
    run("xcodebuild", ["-workspace", "ios/VDSVerify.xcworkspace", "-scheme", "VDSVerify", "-configuration", "Release", "-destination", `platform=iOS Simulator,id=${device}`, "-derivedDataPath", derived, "build", "CODE_SIGNING_ALLOWED=NO", "ONLY_ACTIVE_ARCH=YES"]);
    run("xcrun", ["simctl", "install", device, path.join(derived, "Build/Products/Release-iphonesimulator/VDSVerify.app")]);
} else {
    run("./android/gradlew", ["-p", "android", ":app:assembleRelease", "--console=plain"]);
    const adb = path.join(process.env.ANDROID_HOME || path.join(homedir(), "Library/Android/sdk"), "platform-tools/adb");
    run(adb, ["-s", device, "install", "-r", "android/app/build/outputs/apk/release/app-release.apk"]);
}
console.log("Dedicated Release capture app installed. No upload performed.");
