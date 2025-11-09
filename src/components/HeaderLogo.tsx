import React from "react";
import { View, Image, Text } from "react-native";
// Use require to avoid needing a .d.ts for image modules
const vdsreaderLogo = require("../assets/icons/icon.png");

const HeaderLogoText: React.FC = () => {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "center",
      }}
    >
      <Image style={{ width: 30, height: 30 }} source={vdsreaderLogo} />
      <Text
        style={{
          color: "#0069b4",
          padding: 5,
          fontSize: 22,
        }}
      >
        VDS Verify
      </Text>
    </View>
  );
};

export default HeaderLogoText;
