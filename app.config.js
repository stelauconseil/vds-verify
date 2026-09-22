module.exports = ({ config }) => {
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
