import { WebView } from "react-native-webview";
import { getLabel } from "../components/Label";

const Faq = () => {
  return (
    <WebView
      source={{
        uri: `https://vds-verify.stelau.com/faq-${getLabel("code")}.html`,
      }}
    />
  );
};

export default Faq;
