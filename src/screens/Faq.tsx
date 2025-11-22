import React from "react";
import { WebView } from "react-native-webview";
import { getLabel } from "@/components/Label";

type Props = { lang: string };

const Faq: React.FC<Props> = ({ lang }) => {
  return (
    <WebView
      source={{
        uri: `https://vds-verify.stelau.com/faq-${getLabel("code", lang)}.html`,
      }}
    />
  );
};

export default Faq;
