import React from "react";
import { useIsFocused } from "@react-navigation/native";
import { View, StyleSheet } from "react-native";
import { Text, ListItem, Icon } from "@rneui/themed";
import { Picker } from "@react-native-picker/picker";
import { getLabel, saveLang } from "../components/Label";
import PropTypes from "prop-types";

const SettingsView = ({ navigation, lang, setLang }) => {
  const isFocused = useIsFocused();

  return (
    <>
      {isFocused && (
        <>
          <View>
            <Text style={styles.title}>{getLabel("information", lang)}</Text>

            <ListItem
              key={1}
              style={styles.listTop}
              onPress={() => navigation.navigate("about")}
            >
              <Icon
                name="chatbox-ellipses-outline"
                type="ionicon"
                color="gray"
              />
              <ListItem.Content>
                <ListItem.Title>{getLabel("about", lang)}</ListItem.Title>
              </ListItem.Content>
              <ListItem.Chevron />
            </ListItem>

            <ListItem
              key={2}
              style={styles.listMiddle}
              onPress={() => navigation.navigate("faq")}
            >
              <Icon name="help-circle-outline" type="ionicon" color="gray" />
              <ListItem.Content>
                <ListItem.Title>{getLabel("faq", lang)}</ListItem.Title>
              </ListItem.Content>
              <ListItem.Chevron />
            </ListItem>

            <ListItem
              key={3}
              style={styles.listMiddle}
              onPress={() => navigation.navigate("usepolicy")}
            >
              <Icon name="receipt-outline" type="ionicon" color="gray" />
              <ListItem.Content>
                <ListItem.Title>{getLabel("usepolicy", lang)}</ListItem.Title>
              </ListItem.Content>
              <ListItem.Chevron />
            </ListItem>

            <ListItem
              key={4}
              style={styles.listMiddle}
              onPress={() => navigation.navigate("privacypolicy")}
            >
              <Icon
                name="information-circle-outline"
                type="ionicon"
                color="gray"
              />
              <ListItem.Content>
                <ListItem.Title>
                  {getLabel("privacypolicy", lang)}
                </ListItem.Title>
              </ListItem.Content>
              <ListItem.Chevron />
            </ListItem>

            <ListItem
              key={5}
              style={styles.listBotton}
              onPress={() => navigation.navigate("history")}
            >
              <Icon name="archive-outline" type="ionicon" color="gray" />
              <ListItem.Content>
                <ListItem.Title>{getLabel("history", lang)}</ListItem.Title>
              </ListItem.Content>
              <ListItem.Chevron />
            </ListItem>

            <Text style={styles.title}>{getLabel("language", lang)}</Text>
            <Picker
              style={styles.picker}
              itemStyle={styles.pickerItem}
              selectedValue={lang || "en"} // Fallback to "en" if lang is undefined
              onValueChange={(itemValue) => {
                setLang(itemValue);
                saveLang(itemValue);
              }}
            >
              <Picker.Item label="English" value="en" />
              <Picker.Item label="Français" value="fr" />
            </Picker>
          </View>
        </>
      )}
    </>
  );
};

SettingsView.propTypes = {
  navigation: PropTypes.object.isRequired,
  lang: PropTypes.string.isRequired,
  setLang: PropTypes.func.isRequired,
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
    color: "gray",
    margin: 20,
    fontVariant: "small-caps",
  },
  listTop: {
    width: "90%",
    alignSelf: "center",
    overflow: "hidden",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  listMiddle: {
    width: "90%",
    alignSelf: "center",
    overflow: "hidden",
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

export default SettingsView;
