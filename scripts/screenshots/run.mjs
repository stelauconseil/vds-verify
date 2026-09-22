import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

const platform = process.argv[2];
if (!["ios", "android", "all"].includes(platform)) throw Error("Expected ios, android or all");
const env = { ...process.env, MAESTRO_CLI_NO_ANALYTICS: "1", MAESTRO_CLI_ANALYSIS_NOTIFICATION_DISABLED: "true" };
const maestro = process.env.MAESTRO_BIN || (existsSync(path.join(homedir(), ".maestro/bin/maestro")) ? path.join(homedir(), ".maestro/bin/maestro") : "maestro");
function run(command, args, capture = false) {
    const result = spawnSync(command, args, { env, encoding: "utf8", stdio: capture ? "pipe" : "inherit" });
    if (result.error || result.status !== 0) throw Error(result.error?.message || result.stderr || `${command} failed`);
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
        if (target === "ios") run("xcrun", ["simctl", "status_bar", device, "override", "--time", "9:41", "--dataNetwork", "wifi", "--wifiMode", "active", "--wifiBars", "3", "--batteryState", "charged", "--batteryLevel", "100"]);
        for (const language of (process.env.SCREENSHOT_LANGUAGES || "fr,en").split(",")) {
            for (const theme of (process.env.SCREENSHOT_THEMES || "light,dark").split(",")) {
                if (!["fr", "en"].includes(language) || !["light", "dark"].includes(theme)) throw Error("Unsupported language/theme");
                for (const flow of ["history", "identity", "driving-record", "settings"]) {
                    const url = `vdsverify-screenshots://screenshots?lang=${language}&theme=${theme}&screen=history`;
                    // Native launch avoids iOS browser confirmation and Android URL shell parsing.
                    if (target === "ios") run("xcrun", ["simctl", "openurl", device, url]);
                    else run(adb, ["-s", device, "shell", "am", "start", "-a", "android.intent.action.VIEW", "-d", `'${url}'`, "com.stelau.vdsverify.screenshots"]);
                    run(maestro, ["--device", device, "test", "--test-output-dir", path.join(root, language, theme, flow), `.maestro/${flow}.yaml`]);
                }
            }
        }
    } finally {
        if (rotation) for (const [key, value] of Object.entries(rotation)) {
            run(adb, ["-s", device, "shell", "settings", ...(value === "null" ? ["delete", "system", key] : ["put", "system", key, value])]);
        }
        if (target === "ios") run("xcrun", ["simctl", "status_bar", device, "clear"]);
    }
    const files = readdirSync(root, { recursive: true }).filter(f => /0[1-5]-.*\.png$/.test(f));
    const expected = 5 * (process.env.SCREENSHOT_LANGUAGES || "fr,en").split(",").length * (process.env.SCREENSHOT_THEMES || "light,dark").split(",").length;
    if (files.length !== expected) throw Error(`Expected ${expected} captures, found ${files.length} in ${root}`);
    const manifest = files.map(file => {
        const png = readFileSync(path.join(root, file));
        return { file, width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
    });
    writeFileSync(path.join(root, "manifest.json"), JSON.stringify(manifest, null, 2));
    writeFileSync(path.join(root, "index.html"), `<!doctype html><meta charset="utf-8"><title>VDS Verify screenshots</title><style>body{font:16px system-ui;background:#eee}main{display:flex;flex-wrap:wrap}figure{width:300px}img{width:100%}figcaption{overflow-wrap:anywhere}</style><h1>VDS Verify — ${target}</h1><main>${manifest.map(f => `<figure><img src="${f.file.split(path.sep).map(encodeURIComponent).join("/")}"><figcaption>${f.file} (${f.width} × ${f.height})</figcaption></figure>`).join("")}</main>`);
    console.log(`Review captures: ${path.join(root, "index.html")}`);
}
