import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PropTypes from "prop-types";
import { formatData } from "../components/Label";

const HistoryScreen = ({ lang }) => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const storedHistory =
        JSON.parse(await AsyncStorage.getItem("scanHistory")) || [];
      setHistory(storedHistory);
    };
    fetchHistory();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={history}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.timestamp}>
              {formatData(item.timestamp, lang)}
            </Text>
            {/* <Text style={styles.data}>{item.data}</Text> */}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  item: {
    marginBottom: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  timestamp: {
    fontSize: 12,
    color: "#888",
  },
  data: {
    fontSize: 16,
    color: "#000",
  },
});

HistoryScreen.propTypes = {
  lang: PropTypes.string.isRequired,
};

export default HistoryScreen;
