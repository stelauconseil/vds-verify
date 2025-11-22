import { useState, useEffect } from "react";
import UsePolicy from "@/screens/UsePolicy";
import { getLang } from "@/components/Label";

export default function UsePolicyRoute() {
  const [lang, setLang] = useState<string>("en");

  useEffect(() => {
    const getLangAsync = async () => {
      const l = await getLang();
      setLang(l);
    };
    getLangAsync();
  }, []);

  return <UsePolicy lang={lang} />;
}
