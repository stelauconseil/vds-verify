import { View, Image } from "react-native";
import { Text } from "@rneui/themed";

const HeaderLogoText = () => {
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
        source={require("../assets/icon.png")}
      />
      <Text
        style={{
          color: "#0a51a1",
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
        source={require("../assets/icon.png")}
      />
    </View>
  );
};

export default HeaderLogoText;
