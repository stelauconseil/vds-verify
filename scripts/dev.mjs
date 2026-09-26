import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const [target, ...args] = process.argv.slice(2);
if (!["start", "ios", "android"].includes(target)) {
    throw Error("Expected start, ios or android");
}

// Explicitly override both the shell and Expo's .env default for capture mode.
const env = { ...process.env, VDS_SCREENSHOTS: "0" };
// The generated exp+vds-verify scheme is also registered by older capture builds.
// Use the normal app's unique scheme so iOS cannot open the Release capture app.
const { expo: config } = JSON.parse(readFileSync(new URL("../app.json", import.meta.url), "utf8"));
const rebuild = args.includes("--rebuild");
const inspectionOnly = args.some(arg => ["--plan", "--help", "-h"].includes(arg));
if (rebuild && (target === "start" || inspectionOnly)) {
    throw Error("Use --rebuild with ios or android, without --plan or --help.");
}
const launchArgs = ["--scheme", config.scheme, ...args.filter(arg => arg !== "--rebuild")];
function run(commandArgs) {
    const result = spawnSync("npx", ["@expo/agent-cli", ...commandArgs], {
        env,
        stdio: "inherit",
    });
    if (result.error) throw result.error;
    if (result.status !== 0) process.exit(result.status ?? 1);
}

if (target === "start") {
    // Only start Metro; use ios/android to regenerate and install the normal app.
    run(["start", ...launchArgs]);
} else {
    // A capture development server can otherwise cause native preparation to be skipped.
    if (!inspectionOnly) {
        run(["dev:stop"]);
    }
    if (rebuild) {
        // The recorded build is per platform, not per simulator. Another simulator
        // can still contain an older native runtime despite a matching fingerprint.
        const recordPath = new URL("../.expo/agent-cli-last-build.json", import.meta.url);
        if (existsSync(recordPath)) {
            const record = JSON.parse(readFileSync(recordPath, "utf8"));
            delete record[target];
            writeFileSync(recordPath, JSON.stringify(record, null, 2) + "\n");
        }
    }
    run(["dev", `--${target}`, ...launchArgs]);
}
