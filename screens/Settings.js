import React, { useStage } from "react";
import { getLocales } from "expo-localization";
import { View, StyleSheet, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";

const Settings = () => {
  const getLang = () => {
    const l = getLocales();
    return l[0].languageCode;
  };

  const [locale, setLocale] = React.useState(React.useState(getLang()));

  console.log(locale);
  return (
    <View style={styles.center}>
      <Text style={styles.title}>Language</Text>
      <Picker
        style={styles.picker}
        itemStyle={styles.pickerItem}
        selectedValue={locale}
        onValueChange={(itemValue, itemIndex) => setLocale(itemValue)}
      >
        <Picker.Item label="English" value="en" />
        <Picker.Item label="Français" value="fr" />
      </Picker>
      <Text>The option you have selected is {locale}</Text>
    </View>
  );
};

const storeData = async (value) => {
  try {
    await AsyncStorage.setItem("my-key", value);
  } catch (e) {
    // saving error
  }
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
