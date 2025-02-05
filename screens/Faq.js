import { WebView } from "react-native-webview";
import PropTypes from "prop-types";

const Faq = ({ lang }) => {
  return (
    <WebView
      source={{
        uri: `https://vds-verify.stelau.com/faq-${lang}.html`,
      }}
    />
  );
};

Faq.propTypes = {
  lang: PropTypes.string.isRequired,
};

export default Faq;
