import { spawnSync } from "node:child_process";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

const platform = process.argv[2];
if (!["ios", "android", "all"].includes(platform)) throw Error("Expected ios, android or all");
const env = process.env;
// Every screen is reached by deep link (see src/app/screenshots.tsx), so any device and display works.
const SCREENS = [["00-scan", "scan"], ["01-history", "history"], ["02-identity", "identity"], ["03-details", "details"], ["04-driving-record", "driving-record"], ["05-settings", "settings"]];
function run(command, args, capture = false) {
    const result = spawnSync(command, args, { env, encoding: "utf8", stdio: capture ? "pipe" : "inherit" });
    if (result.error || result.status !== 0) throw Error(`${command} ${args.join(" ")} failed (exit ${result.status}, signal ${result.signal}).\n${result.error?.message || result.stderr || result.stdout || "See command output above."}`);
    return result.stdout;
}
for (const target of platform === "all" ? ["ios", "android"] : [platform]) {
    const adb = process.env.ADB || path.join(process.env.ANDROID_HOME || path.join(homedir(), "Library/Android/sdk"), "platform-tools/adb");
    const devices = target === "ios"
        ? Object.values(JSON.parse(run("xcrun", ["simctl", "list", "devices", "booted", "--json"], true)).devices).flat().map(d => d.udid)
        : run(adb, ["devices"], true).split("\n").filter(l => /^emulator-\d+\s+device$/.test(l.trim())).map(l => l.split(/\s/)[0]);
    const device = process.env[target === "ios" ? "IOS_DEVICE" : "ANDROID_DEVICE"] || (devices.length === 1 ? devices[0] : undefined);
    if (!device || !devices.includes(device)) throw Error(`Boot one ${target} simulator/emulator or select its ID using ${target === "ios" ? "IOS_DEVICE" : "ANDROID_DEVICE"}. Physical devices are excluded.`);
    const root = path.resolve("build/screenshots", target, device, new Date().toISOString().replaceAll(":", "-"));
    mkdirSync(root, { recursive: true });
    const rotation = target === "android" ? Object.fromEntries(["accelerometer_rotation", "user_rotation"].map(key => [key, run(adb, ["-s", device, "shell", "settings", "get", "system", key], true).trim()])) : null;
    try {
        if (target === "android") {
            run(adb, ["-s", device, "shell", "settings", "put", "system", "accelerometer_rotation", "0"]);
            run(adb, ["-s", device, "shell", "settings", "put", "system", "user_rotation", "0"]);
        }
        // Warm-up launch: the first launch after another app shows a "◀ App" back link in the status bar.
        if (target === "ios") {
            spawnSync("xcrun", ["simctl", "terminate", device, "com.stelau.vdsverify"]);
            run("xcrun", ["simctl", "launch", "--terminate-running-process", device, "com.stelau.vdsverify.screenshots"], true);
            run("sleep", ["4"]);
        }
        if (target === "ios") run("xcrun", ["simctl", "status_bar", device, "override", "--time", "9:41", "--dataNetwork", "wifi", "--wifiMode", "active", "--wifiBars", "3", "--batteryState", "charged", "--batteryLevel", "100"]);
        if (target === "android") {
            // Warm-up cold start, so the first capture is not taken while the app is still launching.
            run(adb, ["-s", device, "shell", "am", "force-stop", "com.stelau.vdsverify.screenshots"]);
            run(adb, ["-s", device, "shell", "monkey", "-p", "com.stelau.vdsverify.screenshots", "1"], true);
            run("sleep", ["8"]);
            run(adb, ["-s", device, "shell", "settings", "put", "global", "sysui_demo_allowed", "1"]);
            for (const extras of [["-e", "command", "enter"], ["-e", "command", "clock", "-e", "hhmm", "0941"], ["-e", "command", "battery", "-e", "level", "100", "-e", "plugged", "false"], ["-e", "command", "network", "-e", "wifi", "show", "-e", "level", "4"], ["-e", "command", "notifications", "-e", "visible", "false"]]) {
                run(adb, ["-s", device, "shell", "am", "broadcast", "-a", "com.android.systemui.demo", ...extras], true);
            }
        }
        for (const language of (process.env.SCREENSHOT_LANGUAGES || "fr,en").split(",")) {
            for (const theme of (process.env.SCREENSHOT_THEMES || "light,dark").split(",")) {
                if (!["fr", "en"].includes(language) || !["light", "dark"].includes(theme)) throw Error("Unsupported language/theme");
                const dir = path.join(root, language, theme);
                mkdirSync(dir, { recursive: true });
                for (const [name, screen] of SCREENS) {
                    const url = `vdsverify-screenshots://screenshots?lang=${language}&theme=${theme}&screen=${screen}`;
                    const file = path.join(dir, `${name}.png`);
                    // iOS 27 confirms every simctl openurl: relaunch with launch arguments instead (src/screenshots.ts).
                    if (target === "ios") run("xcrun", ["simctl", "launch", "--terminate-running-process", device, "com.stelau.vdsverify.screenshots", "-vdsScreen", screen, "-vdsLang", language, "-vdsTheme", theme], true);
                    else run(adb, ["-s", device, "shell", "am", "start", "-a", "android.intent.action.VIEW", "-d", `'${url}'`, "com.stelau.vdsverify.screenshots"]);
                    run("sleep", [process.env.SCREENSHOT_WAIT || "4"]); // ponytail: fixed wait, raise SCREENSHOT_WAIT if a capture is mid-transition
                    // IOS_DISPLAY / ANDROID_DISPLAY pick one screen of a multi-display device (iPhone Duo, foldables).
                    if (target === "ios") run("xcrun", ["simctl", "io", device, "screenshot", ...(process.env.IOS_DISPLAY ? [`--display=${process.env.IOS_DISPLAY}`] : []), file]);
                    else writeFileSync(file, spawnSync(adb, ["-s", device, "exec-out", "screencap", "-p", ...(process.env.ANDROID_DISPLAY ? ["-d", process.env.ANDROID_DISPLAY] : [])], { maxBuffer: 64 << 20 }).stdout);
                }
            }
        }
    } finally {
        if (target === "android") run(adb, ["-s", device, "shell", "am", "broadcast", "-a", "com.android.systemui.demo", "-e", "command", "exit"], true);
        if (rotation) for (const [key, value] of Object.entries(rotation)) {
            run(adb, ["-s", device, "shell", "settings", ...(value === "null" ? ["delete", "system", key] : ["put", "system", key, value])]);
        }
        if (target === "ios") run("xcrun", ["simctl", "status_bar", device, "clear"]);
    }
    const files = readdirSync(root, { recursive: true }).filter(f => /0[0-5]-.*\.png$/.test(f));
    const expected = SCREENS.length * (process.env.SCREENSHOT_LANGUAGES || "fr,en").split(",").length * (process.env.SCREENSHOT_THEMES || "light,dark").split(",").length;
    if (files.length !== expected) throw Error(`Expected ${expected} captures, found ${files.length} in ${root}`);
    const manifest = files.map(file => {
        const png = readFileSync(path.join(root, file));
        return { file, width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
    });
    writeFileSync(path.join(root, "manifest.json"), JSON.stringify(manifest, null, 2));
    writeFileSync(path.join(root, "index.html"), `<!doctype html><meta charset="utf-8"><title>VDS Verify screenshots</title><style>body{font:16px system-ui;background:#eee}main{display:flex;flex-wrap:wrap}figure{width:300px}img{width:100%}figcaption{overflow-wrap:anywhere}</style><h1>VDS Verify — ${target}</h1><main>${manifest.map(f => `<figure><img src="${f.file.split(path.sep).map(encodeURIComponent).join("/")}"><figcaption>${f.file} (${f.width} × ${f.height})</figcaption></figure>`).join("")}</main>`);
    console.log(`Review captures: ${path.join(root, "index.html")}`);
}
