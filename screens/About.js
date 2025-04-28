import { View, StyleSheet, Linking } from "react-native";
import * as Application from "expo-application";
import { Text } from "@rneui/themed";

const About = () => {
  return (
    <View style={styles.left}>
      {/* <Image style={{ width: 30, height: 30 }} source={logo} /> */}
      <Text style={styles.title}>
        {Application.applicationName} {Application.nativeApplicationVersion}{" "}
        (build {Application.nativeBuildVersion})
      </Text>
      {/* <Text style={styles.title}>VDS Verify </Text> */}
      <Text
        style={styles.title}
        onPress={() => Linking.openURL("https://vds-verify.stelau.com")}
      >
        ©️ {new Date().getFullYear()} Stelau
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    // justifyContent: "center",
    // alignItems: "center",
    textAlign: "left",
  },
  title: {
    fontSize: 16,
    textAlign: "left",
    margin: 20,
  },
});

export default About;
