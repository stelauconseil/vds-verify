import React from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

type CustomTabBarProps = BottomTabBarProps & {
  // Injected via route params on scan screen when a result is present
};

const CustomTabBar: React.FC<CustomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  // Detect if we are on the scan tab and if it has a result (via params)
  const scanIndex = state.routes.findIndex((r) => r.name === "scan");
  const scanRoute = state.routes[scanIndex];
  // For future use: route params/state could drive conditional status icon
  const scanOptions = descriptors[scanRoute?.key || ""]?.options as any;
  const resultStatus = scanOptions?.resultStatus as
    | "valid"
    | "invalid"
    | "nonverifiable"
    | undefined;

  const statusMeta: Record<string, { color: string; icon: string }> = {
    valid: { color: "green", icon: "shield-checkmark" },
    invalid: { color: "red", icon: "shield" },
    nonverifiable: { color: "orange", icon: "help-circle" },
  };

  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;
        const isScan = route.name === "scan";
        const hasResult = !!resultStatus;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (event.defaultPrevented) return;
          // If we are on scan tab and a result exists, treat press as reset scan
          if (isScan && hasResult) {
            // Use a changing value to ensure params update even if already focused
            navigation.navigate("scan", { resetScan: Date.now() });
            return;
          }
          if (!isFocused) {
            navigation.navigate(route.name, route.params);
          }
        };

        const iconName =
          route.name === "scan"
            ? isFocused
              ? "qr-code-outline"
              : "qr-code"
            : isFocused
              ? "settings"
              : "settings-outline";

        const iconColor =
          isScan && hasResult ? "gray" : isFocused ? "#0069b4" : "gray";
        return (
          <View key={route.key} style={styles.tabWrapper}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              style={styles.tab}
            >
              <Ionicons name={iconName} size={24} color={iconColor} />
              <Text
                style={{
                  color: iconColor,
                  fontSize: 12,
                }}
              >
                {String(label)}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}

      {/* When on result screen (scan has result), show a status chip next to the scan icon */}
      {/* We can leverage navigation.setParams via scan screen to toggle a headerRight-like action.
          Since BottomTabBar doesn't accept arbitrary extra items inline easily per-tab, we add
          a small floating chip aligned near the scan tab. The scan screen will pass colors/text
          via tabBarBadge-like options. */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#ddd",
    paddingBottom: 15,
    paddingTop: 15,
    justifyContent: "space-around",
    alignItems: "center",
  },
  tabWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingHorizontal: 10,
  },
});

export default CustomTabBar;
