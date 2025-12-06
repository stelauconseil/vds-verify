import { FC, useState, useCallback } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  Text,
  Alert,
  Pressable,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { formatData, getLabel } from "@/components/Label";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

type HistoryEntry = { timestamp: string; data: any };
type Props = { navigation: any; lang: string };

const ROW_BG_1 = "#F7F9FC"; // very light blue-gray
const ROW_BG_2 = "#EEF2F7"; // slightly darker

const HistoryScreen: FC<Props> = ({ navigation, lang }) => {
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
      {/* Title header with safe area top inset and trash icon */}
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: "5%",
          paddingBottom: 8,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text style={styles.title}>{getLabel("history", lang)}</Text>
        {history.length > 0 && (
          <BlurView
            intensity={70}
            tint="light"
            style={{ borderRadius: 18, overflow: "hidden" }}
          >
            <Pressable
              onPress={() =>
                Alert.alert(
                  getLabel("deleteHistory", lang) || "Clear history",
                  getLabel("deleteHistoryMessage", lang) ||
                    "Do you really want to delete all history entries?",
                  [
                    {
                      text: getLabel("cancel", lang) || "Cancel",
                      style: "cancel",
                    },
                    {
                      text: getLabel("ok", lang) || "Ok",
                      style: "destructive",
                      onPress: () => void deleteHistory(),
                    },
                  ],
                  { cancelable: true }
                )
              }
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={getLabel("deleteHistory", lang)}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(255,255,255,0.3)",
                }}
              >
                <Ionicons name="trash" size={20} color="#6b7280" />
              </View>
            </Pressable>
          </BlurView>
        )}
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
          const rawDocType = entry.data?.header?.["Type de document"] as
            | string
            | undefined;
          const docType = rawDocType
            ? rawDocType
                .split(" ")
                .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
                .join(" ")
            : undefined;
          const manifest = entry.data?.header?.["manifest_ID"] as
            | string
            | undefined;
          const date = (formatData(entry.timestamp, lang) as string) || "";

          return (
            <Pressable
              key={entry.timestamp}
              onPress={() =>
                navigation.navigate("result", { result: entry.data })
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
                  {docType
                    ? docType
                    : `${getLabel("manifest_ID", lang)}: ${manifest ?? ""}`}
                </Text>
                <Text style={{ color: "#374151", fontSize: 12, marginTop: 2 }}>
                  {date}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
  },
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
