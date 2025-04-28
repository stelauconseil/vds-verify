import { WebView } from "react-native-webview";
import { getLabel } from "../components/Label";

const PrivacyPolicy = () => {
  return (
    <WebView
      source={{
        uri: `https://vds-verify.stelau.com/privacy-policy-${getLabel("code")}.html`,
      }}
    />
  );
};

export default PrivacyPolicy;
