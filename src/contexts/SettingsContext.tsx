import {
    ReactNode,
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    getLang as getLangFromLabels,
    saveLang as saveLangToStorage,
} from "@/components/Label";

export type ColorSchemePref = "system" | "light" | "dark";

type SettingsContextType = {
    lang: string;
    setLang: (l: string) => Promise<void>;
    historyEnabled: boolean;
    setHistoryEnabled: (v: boolean) => Promise<void>;
    advancedMode: boolean;
    setAdvancedMode: (v: boolean) => Promise<void>;
    colorSchemePref: ColorSchemePref;
    setColorSchemePref: (v: ColorSchemePref) => Promise<void>;
};

const SettingsContext = createContext<SettingsContextType | undefined>(
    undefined,
);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [lang, setLangState] = useState<string>("en");
    const [historyEnabled, setHistoryEnabledState] = useState<boolean>(true);
    const [advancedMode, setAdvancedModeState] = useState<boolean>(false);
    const [colorSchemePref, setColorSchemePrefState] =
        useState<ColorSchemePref>("system");

    useEffect(() => {
        (async () => {
            const l = await getLangFromLabels();
            setLangState(l);
            try {
                const stored = await AsyncStorage.getItem("historyEnabled");
                setHistoryEnabledState(stored !== "false");
                const storedAdvanced =
                    await AsyncStorage.getItem("advancedMode");
                setAdvancedModeState(storedAdvanced === "true");
                const storedScheme =
                    await AsyncStorage.getItem("colorSchemePref");
                if (storedScheme === "light" || storedScheme === "dark") {
                    setColorSchemePrefState(storedScheme);
                } else {
                    setColorSchemePrefState("system");
                }
            } catch {
                setHistoryEnabledState(true);
            }
        })();
    }, []);

    const setLang = async (l: string) => {
        setLangState(l);
        await saveLangToStorage(l);
    };

    const setHistoryEnabled = async (v: boolean) => {
        setHistoryEnabledState(v);
        try {
            await AsyncStorage.setItem("historyEnabled", v ? "true" : "false");
            if (!v) {
                await AsyncStorage.removeItem("scanHistory");
            }
        } catch (e) {
            // noop
        }
    };

    const setAdvancedMode = async (v: boolean) => {
        setAdvancedModeState(v);
        try {
            await AsyncStorage.setItem("advancedMode", v ? "true" : "false");
        } catch {
            // noop
        }
    };

    const setColorSchemePref = async (v: ColorSchemePref) => {
        setColorSchemePrefState(v);
        try {
            await AsyncStorage.setItem("colorSchemePref", v);
        } catch {
            // noop
        }
    };

    return (
        <SettingsContext.Provider
            value={{
                lang,
                setLang,
                historyEnabled,
                setHistoryEnabled,
                advancedMode,
                setAdvancedMode,
                colorSchemePref,
                setColorSchemePref,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const ctx = useContext(SettingsContext);
    if (!ctx)
        throw new Error("useSettings must be used within SettingsProvider");
    return ctx;
}

export function useEffectiveColorScheme(): "light" | "dark" {
    const { colorSchemePref } = useSettings();
    const system = useColorScheme() ?? "light";
    return colorSchemePref === "system" ? system : colorSchemePref;
}
