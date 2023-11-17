import React from "react";
import PropTypes from "prop-types";
import { View, StyleSheet, Text } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { getLabel, saveLang } from "../components/Label";

const Settings = ({ settings }) => {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>{getLabel(settings.lang, "language")}</Text>
      <Picker
        style={styles.picker}
        itemStyle={styles.pickerItem}
        selectedValue={settings.lang}
        onValueChange={(itemValue, itemIndex) => {
          settings.setLang(itemValue);
          saveLang(itemValue);
        }}
      >
        <Picker.Item label="English" value="en" />
        <Picker.Item label="Français" value="fr" />
      </Picker>
    </View>
  );
};

Settings.propTypes = {
  settings: PropTypes.object.isRequired,
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    // justifyContent: "center",
    // alignItems: "center",
    textAlign: "center",
  },
  title: {
    fontSize: 16,
    textAlign: "center",
    margin: 20,
  },
  picker: {
    width: 200,
    alignSelf: "center",
    // height: 100,
    // backgroundColor: "#FFF0E0",
    // borderColor: "gray",
    // borderWidth: 1,
    // borderCurve: 10,
  },
  pickerItem: {
    fontSize: "16",
  },
});

export default Settings;
