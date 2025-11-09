import React from "react";
import { View, StyleSheet, Linking, Text } from "react-native";
import * as Application from "expo-application";

const About: React.FC = () => {
  return (
    <View style={styles.left}>
      <Text style={styles.title}>
        {Application.applicationName} {Application.nativeApplicationVersion}{" "}
        (build {Application.nativeBuildVersion})
      </Text>
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
  left: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    textAlign: "left",
    margin: 20,
  },
});

export default About;
