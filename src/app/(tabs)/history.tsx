import React from "react";
import { useRouter, usePathname } from "expo-router";
import HistoryScreen from "@/screens/HistoryScreen";
import { useSettings } from "@/contexts/SettingsContext";

export default function HistoryRoute() {
    const { lang } = useSettings();
    const router = useRouter();
    const pathname = usePathname();
    const isFocused = pathname === "/history";

    return (
        <HistoryScreen
            lang={lang}
            isFocused={isFocused}
            navigation={{
                navigate: (route: string, params?: any) => {
                    if (route === "result" || route === "result/data") {
                        router.push({
                            pathname: "/result",
                            params: params
                                ? { result: JSON.stringify(params.result) }
                                : {},
                        });
                    }
                },
            }}
        />
    );
}
