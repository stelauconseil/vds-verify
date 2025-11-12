import React, { useEffect, useRef, useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Animated,
  Platform,
  LayoutChangeEvent,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { GlassView } from "expo-glass-effect";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

  const insets = useSafeAreaInsets();
  const [width, setWidth] = useState(0);
  const tabCount = state.routes.length || 1;
  const tabWidth = width / tabCount;
  const indicatorX = useRef(
    new Animated.Value(state.index * (tabWidth || 0))
  ).current;

  useEffect(() => {
    Animated.timing(indicatorX, {
      toValue: state.index * (tabWidth || 0),
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [state.index, tabWidth, indicatorX]);

  const onLayout = (e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  };

  const GlassContainer: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => {
    // On iOS use GlassView for richer materials, Android fallback to BlurView or plain view.
    if (Platform.OS === "ios") {
      return (
        <GlassView style={styles.glass} tintColor="rgba(255,255,255,0.15)">
          {children}
        </GlassView>
      );
    }
    return (
      <BlurView intensity={50} tint="light" style={styles.glass}>
        {children}
      </BlurView>
    );
  };

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom + 10 }]}>
      <GlassContainer>
        <View style={styles.container} onLayout={onLayout}>
          {width > 0 && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.indicator,
                {
                  width: Math.max(tabWidth - 14, 0),
                  transform: [
                    {
                      translateX: Animated.add(
                        indicatorX,
                        new Animated.Value(7)
                      ),
                    },
                  ],
                },
              ]}
            />
          )}
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
              <View
                key={route.key}
                style={[styles.tabWrapper, { width: tabWidth || undefined }]}
              >
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  onPress={onPress}
                  style={styles.tab}
                >
                  <Ionicons
                    name={iconName as any}
                    size={22}
                    color={iconColor}
                  />
                  <Text
                    style={{ color: iconColor, fontSize: 11 }}
                    numberOfLines={1}
                  >
                    {String(label)}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </GlassContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 14,
    paddingTop: 6,
    backgroundColor: "transparent",
  },
  glass: {
    borderRadius: 20,
    overflow: "hidden",
  },
  container: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingVertical: 10,
    paddingHorizontal: 6,
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
  },
  indicator: {
    position: "absolute",
    top: 4,
    bottom: 4,
    left: 0,
    backgroundColor: "rgba(255,255,255,0.35)",
    borderRadius: 16,
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
    paddingVertical: 6,
  },
});

export default CustomTabBar;
