import { WebView } from "react-native-webview";
import PropTypes from "prop-types";

const PrivacyPolicy = ({ lang }) => {
  return (
    <WebView
      source={{
        uri: `https://vds-verify.stelau.com/privacy-policy-${lang}.html`,
      }}
    />
  );
};

PrivacyPolicy.propTypes = {
  lang: PropTypes.string.isRequired,
};

export default PrivacyPolicy;
