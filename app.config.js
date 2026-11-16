const { withAndroidManifest } = require("expo/config-plugins");

// Android phones: portrait only. Android 16+ ignores this lock on large screens (sw >= 600dp),
// so unfolded foldables and tablets still rotate. iOS keeps "orientation" from app.json.
const withAndroidPortrait = (config) =>
    withAndroidManifest(config, (mod) => {
        const activity = mod.modResults.manifest.application[0].activity.find(
            (a) => a.$["android:name"] === ".MainActivity",
        );
        activity.$["android:screenOrientation"] = "portrait";
        return mod;
    });

module.exports = ({ config }) => {
    config = withAndroidPortrait(config);
    if (process.env.EAS_BUILD_PROFILE === "development") {
        config.ios.entitlements["com.apple.developer.devicecheck.appattest-environment"] = "development";
    }
    if (process.env.VDS_SCREENSHOTS !== "1") return config;
    return {
        ...config,
        name: "VDS Verify",
        slug: "vds-verify-screenshots",
        scheme: "vdsverify-screenshots",
        ios: { ...config.ios, bundleIdentifier: "com.stelau.vdsverify.screenshots" },
        android: { ...config.android, package: "com.stelau.vdsverify.screenshots" },
        extra: { ...config.extra, screenshots: true },
    };
};
