import React from "react";
import { View, StyleSheet, Image } from "react-native";
import * as Application from "expo-application";
import { Text, Button } from "@rneui/themed";
import { getLabel } from "../components/Label";
import logo from "../assets/icon.png";

const About = ({ lang }) => {
  return (
    <View style={styles.left}>
      {/* <Image style={{ width: 30, height: 30 }} source={logo} /> */}
      <Text style={styles.title}>{Application.applicationName}</Text>
      <Text style={styles.title}>
        Version {Application.nativeApplicationVersion}
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
