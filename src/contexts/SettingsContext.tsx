import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getLang as getLangFromLabels,
  saveLang as saveLangToStorage,
} from "@/components/Label";

type SettingsContextType = {
  lang: string;
  setLang: (l: string) => Promise<void>;
  historyEnabled: boolean;
  setHistoryEnabled: (v: boolean) => Promise<void>;
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<string>("en");
  const [historyEnabled, setHistoryEnabledState] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      const l = await getLangFromLabels();
      setLangState(l);
      try {
        const stored = await AsyncStorage.getItem("historyEnabled");
        setHistoryEnabledState(stored !== "false");
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

  return (
    <SettingsContext.Provider
      value={{ lang, setLang, historyEnabled, setHistoryEnabled }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
