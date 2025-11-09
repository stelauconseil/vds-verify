import React from "react";
import { WebView } from "react-native-webview";
import { getLabel } from "../components/Label";

type Props = { lang: string };

const PrivacyPolicy: React.FC<Props> = ({ lang }) => {
  return (
    <WebView
      source={{
        uri: `https://vds-verify.stelau.com/privacy-policy-${getLabel("code", lang)}.html`,
      }}
    />
  );
};

export default PrivacyPolicy;
