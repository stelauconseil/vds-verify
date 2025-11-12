import { useThemeColor } from "../../components/Themed";
import { spaceScale, theme } from "../../theme";
import { Stack } from "expo-router";
import { Platform, StyleSheet, useColorScheme } from "react-native";

export default function ModalsLayout() {
  const tabBarBackgroundColor = useThemeColor(theme.color.background);
  const isDarkMode = useColorScheme() === "dark";
  return (
    <Stack
      screenOptions={{
        headerLargeTitle: true,
        headerLargeTitleShadowVisible: true,
        headerShadowVisible: true,
        presentation: "transparentModal",
        animation: "slide_from_bottom",
      }}
    />
  );
}
