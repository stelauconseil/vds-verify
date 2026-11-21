const { withAndroidManifest } = require("expo/config-plugins");

// ML Kit's scanner activities (expo-camera) lock to portrait, which makes Play infer a required
// android.hardware.screen.portrait and hide the app from landscape-only devices. Mark it optional.
module.exports = (config) =>
    withAndroidManifest(config, (config) => {
        const manifest = config.modResults.manifest;
        const name = "android.hardware.screen.portrait";
        manifest["uses-feature"] = (manifest["uses-feature"] ?? []).filter(
            (feature) => feature.$["android:name"] !== name,
        );
        manifest["uses-feature"].push({
            $: { "android:name": name, "android:required": "false" },
        });
        return config;
    });
