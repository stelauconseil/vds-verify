import { WebView } from "react-native-webview";
import { getLabel } from "../components/Label";

const PrivacyPolicy = () => {
  return (
    <WebView
      source={{
        uri: `https://vds-verify.stelau.com/use-policy-${getLabel("code")}.html`,
      }}
    />
  );
};

export default PrivacyPolicy;
