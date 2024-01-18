import React from "react";
import { View, StyleSheet } from "react-native";
import * as Application from "expo-application";
import { Text } from "@rneui/themed";
import PropTypes from "prop-types";

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

About.propTypes = {
  lang: PropTypes.string.isRequired,
};

export default About;
