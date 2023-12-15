import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, ListItem, Icon } from "@rneui/themed";
import { Picker } from "@react-native-picker/picker";
import { getLabel, saveLang } from "../components/Label";

const Settings = ({ navigation, lang, setLang }) => {
  return (
    <View>
      <Text style={styles.title}>{getLabel(lang, "information")}</Text>
      <ListItem
        style={styles.listMiddle}
        onPress={() => navigation.navigate("about")}
      >
        <Icon name="chatbox-ellipses-outline" type="ionicon" color="grey" />
        <ListItem.Content>
          <ListItem.Title>{getLabel(lang, "about")}</ListItem.Title>
        </ListItem.Content>
        <ListItem.Chevron />
      </ListItem>
      <ListItem
        style={styles.listBotton}
        onPress={() => navigation.navigate("usepolicy")}
      >
        <Icon name="receipt-outline" type="ionicon" color="grey" />
        <ListItem.Content>
          <ListItem.Title>{getLabel(lang, "usepolicy")}</ListItem.Title>
        </ListItem.Content>
        <ListItem.Chevron />
      </ListItem>
      <ListItem
        style={styles.listBotton}
        onPress={() => navigation.navigate("privacypolicy")}
      >
        <Icon name="information-circle-outline" type="ionicon" color="grey" />
        <ListItem.Content>
          <ListItem.Title>{getLabel(lang, "privacypolicy")}</ListItem.Title>
        </ListItem.Content>
        <ListItem.Chevron />
      </ListItem>
      <Text style={styles.title}>{getLabel(lang, "language")}</Text>

      <Picker
        style={styles.picker}
        itemStyle={styles.pickerItem}
        selectedValue={lang}
        onValueChange={(itemValue, itemIndex) => {
          setLang(itemValue);
          saveLang(itemValue);
        }}
      >
        <Picker.Item label="English" value="en" />
        <Picker.Item label="Français" value="fr" />
      </Picker>
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    // justifyContent: "center",
    // alignItems: "center",
    textAlign: "center",
    // color: "#0069b4",
  },
  title: {
    fontSize: 16,
    textAlign: "left",
    color: "grey",
    margin: 20,
    fontVariant: "small-caps",
  },
  listMiddle: {
    width: "90%",
    alignSelf: "center",
    overflow: "hidden",
  },
  listTop: {
    width: "90%",
    alignSelf: "center",
    overflow: "hidden",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  listBotton: {
    width: "90%",
    alignSelf: "center",
    overflow: "hidden",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  picker: {
    width: "90%",
    alignSelf: "center",
    // height: "2",
    // backgroundColor: "#FFF0E0",
    // borderColor: "white",
    // borderWidth: 10,
    borderCurve: 10,
  },
  pickerItem: {
    fontSize: "16",
  },
});

export default Settings;
