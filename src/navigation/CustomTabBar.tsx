import React from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";

type CustomTabBarProps = BottomTabBarProps;

const CustomTabBar: React.FC<CustomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  // Determine if Scan has a result to alter appearance/behavior
  const scanRoute = state.routes.find((r) => r.name === "scan");
  const scanOptions = scanRoute
    ? (descriptors[scanRoute.key]?.options as any)
    : undefined;
  const resultStatus = scanOptions?.resultStatus as
    | "valid"
    | "invalid"
    | "nonverifiable"
    | undefined;
  const hasResult = !!resultStatus;

  return (
    <View style={styles.wrapper}>
      <BlurView intensity={40} tint="light" style={styles.glass}>
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

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (event.defaultPrevented) return;
              if (isScan && hasResult) {
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
                  <Ionicons
                    name={iconName as any}
                    size={24}
                    color={iconColor}
                  />
                  <Text style={{ color: iconColor, fontSize: 12 }}>
                    {String(label)}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    padding: 10,
    paddingBottom: 18,
    backgroundColor: "transparent",
  },
  glass: {
    borderRadius: 20,
    overflow: "hidden",
  },
  container: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.6)",
    paddingVertical: 12,
    paddingHorizontal: 8,
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
