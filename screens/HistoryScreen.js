import React, { useState, useCallback } from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import { ListItem, Button, Icon } from "@rneui/themed";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PropTypes from "prop-types";
import { useFocusEffect } from "@react-navigation/native"; // Import useFocusEffect
import { formatData, getLabel } from "../components/Label";

const HistoryScreen = ({ navigation, lang }) => {
  const [history, setHistory] = useState([]);

  // Fetch history whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const fetchHistory = async () => {
        const storedHistory =
          JSON.parse(await AsyncStorage.getItem("scanHistory")) || [];
        setHistory(storedHistory);
      };
      fetchHistory();
    }, [])
  );

  const deleteHistory = async () => {
    try {
      await AsyncStorage.removeItem("scanHistory"); // Remove the history from AsyncStorage
      setHistory([]); // Clear the local state
      console.log("History deleted successfully");
    } catch (error) {
      console.error("Failed to delete history:", error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.center}>
        {history.map((l, i) => (
          <ListItem
            key={i}
            containerStyle={
              i === 0
                ? styles.listTop
                : i === history.length - 1
                  ? styles.listBotton
                  : styles.listMiddle
            }
            onPress={() => navigation.navigate("scan", { result: l.data })} // Navigate to Scan with parameters
          >
            <ListItem.Content>
              <ListItem.Title>{formatData(l.timestamp, lang)}</ListItem.Title>
              <ListItem.Subtitle>
                {l.data.header["Type de document"]
                  ? l.data.header["Type de document"]
                  : getLabel("manifest_ID", lang) +
                    ": " +
                    l.data.header["manifest_ID"]}
              </ListItem.Subtitle>
            </ListItem.Content>
          </ListItem>
        ))}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          onPress={() => deleteHistory()}
          title={getLabel("deleteHistory", lang)}
          icon={<Icon name="trash-outline" type="ionicon" color="white" />}
          iconRight={true}
          buttonStyle={styles.button}
          titleStyle={styles.buttonTitle}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  center: {
    flex: 1,
    paddingTop: 20,
    paddingBottom: 20,
  },
  buttonContainer: {
    padding: 10,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#0069b4",
    borderWidth: 2,
    borderColor: "#0069b4",
    borderRadius: 10,
  },
  buttonTitle: {
    fontSize: 16,
    textAlign: "center",
    color: "white",
    padding: 10,
  },
  listTop: {
    width: "85%",
    alignSelf: "center",
    overflow: "hidden",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  listMiddle: {
    width: "85%",
    alignSelf: "center",
    overflow: "hidden",
  },
  listBotton: {
    width: "85%",
    alignSelf: "center",
    overflow: "hidden",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
});

HistoryScreen.propTypes = {
  lang: PropTypes.string.isRequired,
};

export default HistoryScreen;
