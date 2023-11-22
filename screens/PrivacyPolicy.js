import React from "react";
import { WebView } from "react-native-webview";

const PrivacyPolicy = ({ lang }) => {
  return (
    <WebView
      source={{ uri: `https://vds-verify.stelau.com/privacy-policy-${lang}` }}
    />
  );
};

export default PrivacyPolicy;
