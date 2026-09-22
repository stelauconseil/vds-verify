import { useEffect, useRef } from "react";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSettings } from "@/contexts/SettingsContext";
import { useScanStatus } from "@/contexts/ScanStatusContext";
import { screenshotsEnabled } from "@/screenshots";
import { testResults } from "@/testdata";

export default function ScreenshotSetup() {
    const settings = useSettings();
    const scan = useScanStatus();
    const router = useRouter();
    const params = useLocalSearchParams();
    const started = useRef(false);
    useEffect(() => {
        if (!screenshotsEnabled || !settings.isReady || started.current) return;
        started.current = true;
        void (async () => {
            await settings.setLang(params.lang === "en" ? "en" : "fr");
            await settings.setColorSchemePref(params.theme === "dark" ? "dark" : "light");
            await settings.setHistoryEnabled(true);
            await settings.setAdvancedMode(false);
            await AsyncStorage.setItem("scanHistory", JSON.stringify(testResults.map((data, index) => ({
                timestamp: new Date(Date.UTC(2026, 8, 21, 9) - index * 3_600_000).toISOString(),
                pinned: false,
                data,
            }))));
            scan.setResult(null);
            scan.setStatus(null);
            router.replace("/history");
        })();
    }, [settings, scan, router, params]);
    return screenshotsEnabled ? null : <Redirect href="/" />;
}
