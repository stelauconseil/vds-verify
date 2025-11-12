import React, { useState, useCallback } from "react";
import { ScrollView, View, StyleSheet, Text, Pressable } from "react-native";
import { Button } from "../components/Button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { formatData, getLabel } from "../components/Label";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type HistoryEntry = { timestamp: string; data: any };
type Props = { navigation: any; lang: string };

const ROW_BG_1 = "#F7F9FC"; // very light blue-gray
const ROW_BG_2 = "#EEF2F7"; // slightly darker

const HistoryScreen: React.FC<Props> = ({ navigation, lang }) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const insets = useSafeAreaInsets();

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
      {/* Title header with safe area top inset */}
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: "5%",
          paddingBottom: 8,
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: "700", color: "#0F172A" }}>
          {getLabel("history", lang)}
        </Text>
      </View>
      <ScrollView
        style={styles.center}
        contentContainerStyle={{
          paddingTop: 8,
          paddingHorizontal: "5%",
          paddingBottom: Math.max(insets.bottom, 8) + 8 + 70,
        }}
      >
        {history.map((entry, index) => {
          const docType = entry.data?.header?.["Type de document"] as
            | string
            | undefined;
          const manifest = entry.data?.header?.["manifest_ID"] as
            | string
            | undefined;
          const title = (formatData(entry.timestamp, lang) as string) || "";

          return (
            <Pressable
              key={entry.timestamp}
              onPress={() =>
                navigation.navigate("scan", { result: entry.data })
              }
              style={{
                backgroundColor: index % 2 === 0 ? ROW_BG_1 : ROW_BG_2,
                borderRadius: 12,
                padding: 12,
                marginBottom: 10,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{ color: "#0F172A", fontSize: 16, fontWeight: "700" }}
                >
                  {title}
                </Text>
                <Text style={{ color: "#374151", fontSize: 12, marginTop: 2 }}>
                  {docType
                    ? docType
                    : `${getLabel("manifest_ID", lang)}: ${manifest ?? ""}`}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Bottom glass bar overlay matching Scan tabbar position */}
      <View
        style={{
          position: "absolute",
          bottom: Math.max(insets.bottom, 8) + 8 + 70,
          left: 10,
          right: 10,
          zIndex: 10,
        }}
      >
        <BlurView
          intensity={70}
          tint="light"
          style={{ borderRadius: 20, overflow: "hidden" }}
        >
          <View
            style={{
              paddingVertical: 10,
              paddingHorizontal: 16,
              backgroundColor: "rgba(255,255,255,0.2)",
            }}
          >
            <Button
              onPress={() => void deleteHistory()}
              title={getLabel("deleteHistory", lang)}
            />
          </View>
        </BlurView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1 },
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
  listTop: {},
  listMiddle: {},
  listBotton: {},
});

export default HistoryScreen;
