import { useRouter } from "expo-router";
import SettingsView from "../../../screens/Settings";
import { useSettings } from "../../../contexts/SettingsContext";

export default function SettingsIndex() {
  const { lang, setLang } = useSettings();
  const router = useRouter();

  return (
    <SettingsView
      lang={lang}
      setLang={setLang}
      navigation={{
        navigate: (route: string) => router.push(`/settings/${route}` as any),
      }}
    />
  );
}
