import { FC, useEffect } from "react";
import { useIsFocused } from "@react-navigation/native";
import {
  StyleSheet,
  View,
  Text,
  Switch,
  Platform,
  Pressable,
} from "react-native";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLabel } from "@/components/Label";
import { useSettings } from "@/contexts/SettingsContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type SettingsViewProps = {
  navigation: any;
  lang: string;
  setLang: (l: string) => void;
};

const SettingsView: FC<SettingsViewProps> = ({ navigation }) => {
  const isFocused = useIsFocused();
  const {
    lang,
    setLang,
    historyEnabled,
    setHistoryEnabled,
    advancedMode,
    setAdvancedMode,
  } = useSettings();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem("historyEnabled");
        const enabled = stored !== "false";
        if (enabled !== historyEnabled) {
          await setHistoryEnabled(enabled);
        }
      } catch {}
    })();
  }, [isFocused]);

  return (
    <>
      {isFocused && (
        <View style={[styles.screen, { paddingTop: insets.top + 8 }]}>
          {/* Title */}
          <Text style={styles.title}>{getLabel("settings", lang)}</Text>
          {/* Info section */}
          <View style={styles.section}>
            <Pressable
              style={styles.row}
              onPress={() => navigation.navigate("about")}
            >
              <Ionicons
                name="chatbox-ellipses-outline"
                size={22}
                color="#8E8E93"
              />
              <Text style={styles.rowLabel}>{getLabel("about", lang)}</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="#C7C7CC"
                style={styles.chevron}
              />
            </Pressable>
            <View style={styles.separator} />
            <Pressable
              style={styles.row}
              onPress={() => navigation.navigate("faq")}
            >
              <Ionicons name="help-circle-outline" size={22} color="#8E8E93" />
              <Text style={styles.rowLabel}>{getLabel("faq", lang)}</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="#C7C7CC"
                style={styles.chevron}
              />
            </Pressable>
            <View style={styles.separator} />
            <Pressable
              style={styles.row}
              onPress={() => navigation.navigate("usepolicy")}
            >
              <Ionicons name="receipt-outline" size={22} color="#8E8E93" />
              <Text style={styles.rowLabel}>{getLabel("usepolicy", lang)}</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="#C7C7CC"
                style={styles.chevron}
              />
            </Pressable>
            <View style={styles.separator} />
            <Pressable
              style={styles.row}
              onPress={() => navigation.navigate("privacypolicy")}
            >
              <Ionicons
                name="information-circle-outline"
                size={22}
                color="#8E8E93"
              />
              <Text style={styles.rowLabel}>
                {getLabel("privacypolicy", lang)}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="#C7C7CC"
                style={styles.chevron}
              />
            </Pressable>
          </View>

          {/* History toggle section */}
          <View style={styles.section}>
            <View style={styles.row}>
              <Ionicons name="archive-outline" size={22} color="#8E8E93" />
              <Text style={styles.rowLabel}>
                {getLabel("historytoggle", lang)}
              </Text>
              <View style={{ flex: 1 }} />
              <Switch
                style={styles.switch}
                value={historyEnabled}
                onValueChange={setHistoryEnabled}
                trackColor={{ false: "#D1D5DB", true: "#34C759" }}
                thumbColor={historyEnabled ? "#FFFFFF" : "#FFFFFF"}
                ios_backgroundColor="#D1D5DB"
              />
            </View>
          </View>

          {/* Advanced mode toggle */}
          <View style={styles.section}>
            <View style={styles.row}>
              <Ionicons name="code-slash-outline" size={22} color="#8E8E93" />
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>
                  {getLabel("advancedmode", lang) || "Advanced mode"}
                </Text>
                <Text style={styles.rowSubLabel}>
                  {getLabel("advancedmode_info", lang)}
                </Text>
              </View>
              <Switch
                style={styles.switch}
                value={advancedMode}
                onValueChange={setAdvancedMode}
                trackColor={{ false: "#D1D5DB", true: "#34C759" }}
                thumbColor={advancedMode ? "#FFFFFF" : "#FFFFFF"}
                ios_backgroundColor="#D1D5DB"
              />
            </View>
          </View>

          {/* Language picker */}
          {/* Language selection (compact segmented) */}
          <View style={styles.section}>
            <View style={styles.row}>
              <Ionicons name="globe-outline" size={22} color="#8E8E93" />
              <Text style={styles.rowLabel}>{getLabel("language", lang)}</Text>
              <View style={{ flex: 1 }} />
              <View style={styles.segment}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: lang === "en" }}
                  onPress={() => setLang("en")}
                  style={[
                    styles.segmentOption,
                    lang === "en" && styles.segmentOptionActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      lang === "en" && styles.segmentTextActive,
                    ]}
                  >
                    EN
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: lang === "fr" }}
                  onPress={() => setLang("fr")}
                  style={[
                    styles.segmentOption,
                    lang === "fr" && styles.segmentOptionActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      lang === "fr" && styles.segmentTextActive,
                    ]}
                  >
                    FR
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F2F2F7", // iOS grouped background
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
    marginHorizontal: "5%",
    marginBottom: 8,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginHorizontal: "5%",
    marginTop: 16,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 24,
    marginBottom: 8,
    marginLeft: "5%",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 56,
    gap: 12,
    backgroundColor: "#FFFFFF",
  },
  switch: {
    alignSelf: "center",
    ...(Platform.OS === "ios" ? { marginTop: -1 } : null),
  },
  rowLabel: {
    fontSize: 16,
    color: "#111827",
    flexShrink: 1,
  },
  rowSubLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  chevron: {
    marginLeft: "auto",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E5E7EB",
    marginLeft: 16 + 22 + 12, // align under text after icon
  },
  picker: {
    width: "90%",
    alignSelf: "center",
    borderRadius: 20,
    color: "gray",
    backgroundColor: "#FFFFFF",
    marginTop: 8,
  },
  pickerItem: { color: "gray", fontSize: 16 },
  segment: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    padding: 2,
    gap: 4,
  },
  segmentOption: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: "transparent",
  },
  segmentOptionActive: {
    backgroundColor: "#007AFF",
  },
  segmentText: {
    fontSize: 13,
    color: "#111827",
    fontWeight: "600",
  },
  segmentTextActive: {
    color: "#FFFFFF",
  },
});

export default SettingsView;
