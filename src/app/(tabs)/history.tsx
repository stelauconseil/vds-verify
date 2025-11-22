import React from "react";
import { useRouter } from "expo-router";
import HistoryScreen from "@/screens/HistoryScreen";
import { useSettings } from "@/contexts/SettingsContext";

export default function HistoryRoute() {
  const { lang } = useSettings();
  const router = useRouter();
  return (
    <HistoryScreen
      lang={lang}
      navigation={{
        navigate: (route: string, params?: any) => {
          if (route === "result") {
            router.push({
              pathname: "/result",
              params: params ? { result: JSON.stringify(params.result) } : {},
            });
          }
        },
      }}
    />
  );
}
