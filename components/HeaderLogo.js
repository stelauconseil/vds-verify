import React, { View, Image } from "react-native";
import { Text } from "@rneui/themed";
import vdsreaderLogo from "../assets/icons/icon.png";

const HeaderLogoText = () => {
  return (
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "flex-start",
        alignItems: "center",
        alignContent: "center",
        alignSelf: "center",
        textAlign: "center",
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

const HeaderLogo = () => {
  return (
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "flex-start",
        alignItems: "center",
      }}
    >
      <Image
        style={{ width: 30, height: 30 }}
        source={require("../assets/icons/icon.png")}
      />
    </View>
  );
};

export default HeaderLogoText;
