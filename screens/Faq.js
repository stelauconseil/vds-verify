import { WebView } from "react-native-webview";
import { getLabel } from "../components/Label";

const Faq = ({ lang }) => {
  return (
    <WebView
      source={{
        uri: `https://vds-verify.stelau.com/faq-${getLabel("code", lang)}.html`,
      }}
    />
  );
};

export default Faq;
