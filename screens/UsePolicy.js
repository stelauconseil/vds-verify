import { WebView } from "react-native-webview";
import { getLabel } from "../components/Label";
import PropTypes from "prop-types";

const PrivacyPolicy = ({ lang }) => {
  return (
    <WebView
      source={{
        uri: `https://vds-verify.stelau.com/use-policy-${getLabel("code", lang)}.html`,
      }}
    />
  );
};

PrivacyPolicy.propTypes = {
  lang: PropTypes.string.isRequired,
};

export default PrivacyPolicy;
