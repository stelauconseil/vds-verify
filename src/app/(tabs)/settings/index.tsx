import { useRouter, usePathname } from "expo-router";
import SettingsView from "@/screens/Settings";
import { useSettings } from "@/contexts/SettingsContext";

export default function SettingsIndex() {
    const { lang, setLang } = useSettings();
    const router = useRouter();
    const pathname = usePathname();
    const isFocused = pathname === "/settings";

    return (
        <SettingsView
            lang={lang}
            setLang={setLang}
            isFocused={isFocused}
            navigation={{
                navigate: (route: string) =>
                    router.push(`/settings/${route}` as any),
            }}
        />
    );
}
