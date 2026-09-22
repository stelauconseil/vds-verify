import Constants from "expo-constants";
import { applicationId } from "expo-application";

// Requires a separate native binary: cannot be activated in the store app by a URL.
export const screenshotsEnabled =
    Constants.expoConfig?.extra?.screenshots === true &&
    applicationId === "com.stelau.vdsverify.screenshots";
