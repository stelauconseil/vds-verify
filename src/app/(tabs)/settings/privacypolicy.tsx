import { useState, useEffect } from "react";
import PrivacyPolicy from "../../../screens/PrivacyPolicy";
import { getLang } from "../../../components/Label";

export default function PrivacyPolicyRoute() {
  const [lang, setLang] = useState<string>("en");

  useEffect(() => {
    const getLangAsync = async () => {
      const l = await getLang();
      setLang(l);
    };
    getLangAsync();
  }, []);

  return <PrivacyPolicy lang={lang} />;
}
