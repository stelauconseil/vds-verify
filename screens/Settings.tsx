import React, { useEffect, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import { StyleSheet, View } from "react-native";
import { Text, ListItem, Icon, Switch } from "@rneui/themed";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLabel, saveLang } from "../components/Label";

type SettingsViewProps = {
  navigation: any;
  lang: string;
  setLang: (l: string) => void;
};

const SettingsView: React.FC<SettingsViewProps> = ({
  navigation,
  lang,
  setLang,
}) => {
  const isFocused = useIsFocused();
  const [historyEnabled, setHistoryEnabled] = useState<boolean>(false);

  useEffect(() => {
    AsyncStorage.getItem("historyEnabled").then((value) => {
      if (value !== null) setHistoryEnabled(value === "true");
    });
  }, [isFocused]);

  const toggleHistory = async (value: boolean) => {
    setHistoryEnabled(value);
    await AsyncStorage.setItem("historyEnabled", value.toString());
    if (!value) {
      await AsyncStorage.removeItem("scanHistory");
    }
  };

  return (
    <>
      {isFocused && (
        <View>
          <Text style={styles.title}>{getLabel("information", lang)}</Text>
          <ListItem
            key="settings-about"
            containerStyle={styles.listTop}
            onPress={() => navigation.navigate("about")}
          >
            <Icon name="chatbox-ellipses-outline" type="ionicon" color="gray" />
            <ListItem.Content>
              <ListItem.Title>{getLabel("about", lang)}</ListItem.Title>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>
          <ListItem
            key="settings-faq"
            containerStyle={styles.listMiddle}
            onPress={() => navigation.navigate("faq")}
          >
            <Icon name="help-circle-outline" type="ionicon" color="gray" />
            <ListItem.Content>
              <ListItem.Title>{getLabel("faq", lang)}</ListItem.Title>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>
          <ListItem
            key="settings-usepolicy"
            containerStyle={styles.listMiddle}
            onPress={() => navigation.navigate("usepolicy")}
          >
            <Icon name="receipt-outline" type="ionicon" color="gray" />
            <ListItem.Content>
              <ListItem.Title>{getLabel("usepolicy", lang)}</ListItem.Title>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>
          <ListItem
            key="settings-privacypolicy"
            containerStyle={styles.listMiddle}
            onPress={() => navigation.navigate("privacypolicy")}
          >
            <Icon
              name="information-circle-outline"
              type="ionicon"
              color="gray"
            />
            <ListItem.Content>
              <ListItem.Title>{getLabel("privacypolicy", lang)}</ListItem.Title>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>
          <ListItem
            key="settings-history-toggle"
            containerStyle={[
              historyEnabled ? styles.listMiddle : styles.listBotton,
              { justifyContent: "space-between" },
            ]}
          >
            <Icon name="archive-outline" type="ionicon" color="gray" />
            <ListItem.Content>
              <ListItem.Title>{getLabel("historytoggle", lang)}</ListItem.Title>
            </ListItem.Content>
            <Switch value={historyEnabled} onValueChange={toggleHistory} />
          </ListItem>
          {historyEnabled && (
            <ListItem
              key="settings-history"
              containerStyle={styles.listBotton}
              onPress={() => navigation.navigate("history")}
            >
              <Icon name="eye-outline" type="ionicon" color="gray" />
              <ListItem.Content>
                <ListItem.Title>{getLabel("history", lang)}</ListItem.Title>
              </ListItem.Content>
              <ListItem.Chevron />
            </ListItem>
          )}
          <Text style={styles.title}>{getLabel("language", lang)}</Text>
          <Picker
            style={styles.picker}
            itemStyle={styles.pickerItem}
            selectedValue={lang || "en"}
            onValueChange={(itemValue) => {
              setLang(itemValue);
              saveLang(itemValue);
            }}
          >
            <Picker.Item key="lang-en" label="English" value="en" />
            <Picker.Item key="lang-fr" label="Français" value="fr" />
          </Picker>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    textAlign: "left",
    color: "gray",
    margin: 20,
  },
  listTop: {
    width: "90%",
    alignSelf: "center",
    overflow: "hidden",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  listMiddle: { width: "90%", alignSelf: "center", overflow: "hidden" },
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
    borderRadius: 10,
    color: "gray",
  },
  pickerItem: { color: "gray", fontSize: 16 },
});

export default SettingsView;
