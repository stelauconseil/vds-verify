import { useState, useEffect } from "react";
import Faq from "../../../screens/Faq";
import { getLang } from "../../../components/Label";

export default function FaqRoute() {
  const [lang, setLang] = useState<string>("en");

  useEffect(() => {
    const getLangAsync = async () => {
      const l = await getLang();
      setLang(l);
    };
    getLangAsync();
  }, []);

  return <Faq lang={lang} />;
}
