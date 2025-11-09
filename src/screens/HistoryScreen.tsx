import React, { useState, useCallback } from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import { ListItem, Icon } from "@rneui/themed";
import { Button } from "../components/Button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { formatData, getLabel } from "../components/Label";

type HistoryEntry = { timestamp: string; data: any };
type Props = { navigation: any; lang: string };

const HistoryScreen: React.FC<Props> = ({ navigation, lang }) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useFocusEffect(
    useCallback(() => {
      const fetchHistory = async () => {
        const storedHistory = JSON.parse(
          (await AsyncStorage.getItem("scanHistory")) || "[]"
        ) as HistoryEntry[];
        setHistory(storedHistory);
      };
      fetchHistory();
    }, [])
  );

  const deleteHistory = async () => {
    try {
      await AsyncStorage.removeItem("scanHistory");
      setHistory([]);
    } catch (error) {
      console.error("Failed to delete history:", error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.center}>
        {history.map((l, i) => (
          <ListItem
            key={l.timestamp}
            containerStyle={
              i === 0
                ? styles.listTop
                : i === history.length - 1
                  ? styles.listBotton
                  : styles.listMiddle
            }
            onPress={() => navigation.navigate("scan", { result: l.data })}
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
          onPress={deleteHistory}
          title={getLabel("deleteHistory", lang)}
          variant="danger"
          containerStyle={{ width: "100%" }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, paddingTop: 20, paddingBottom: 20 },
  buttonContainer: { padding: 10, backgroundColor: "#fff" },
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
  listMiddle: { width: "85%", alignSelf: "center", overflow: "hidden" },
  listBotton: {
    width: "85%",
    alignSelf: "center",
    overflow: "hidden",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
});

export default HistoryScreen;
