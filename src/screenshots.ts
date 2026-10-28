import { Platform, Settings } from "react-native";
import Constants from "expo-constants";
import { applicationId } from "expo-application";

// Requires a separate native binary: cannot be activated in the store app by a URL.
export const screenshotsEnabled =
    Constants.expoConfig?.extra?.screenshots === true &&
    applicationId === "com.stelau.vdsverify.screenshots";

// iOS 27 asks "Open in …?" for every simctl openurl, so captures pass the target as launch
// arguments instead (`-vdsScreen scan -vdsLang fr -vdsTheme light` land in NSUserDefaults).
let launchTargetTaken = false;
export function takeLaunchTarget() {
    if (!screenshotsEnabled || Platform.OS !== "ios" || launchTargetTaken)
        return null;
    launchTargetTaken = true;
    const screen = Settings.get("vdsScreen");
    if (typeof screen !== "string") return null;
    return {
        screen,
        lang: String(Settings.get("vdsLang") ?? "fr"),
        theme: String(Settings.get("vdsTheme") ?? "light"),
    };
}
