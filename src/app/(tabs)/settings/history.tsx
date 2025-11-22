import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import HistoryScreen from "../../../screens/HistoryScreen";
import { getLang } from "../../../components/Label";

export default function HistoryRoute() {
  const [lang, setLang] = useState<string>("en");
  const router = useRouter();

  useEffect(() => {
    const getLangAsync = async () => {
      const l = await getLang();
      setLang(l);
    };
    getLangAsync();
  }, []);

  return (
    <HistoryScreen
      lang={lang}
      navigation={{
        navigate: (route: string, params?: any) => {
          if (route === "scan") {
            router.push({
              pathname: "/",
              params: params ? { result: JSON.stringify(params.result) } : {},
            });
          }
        },
      }}
    />
  );
}
