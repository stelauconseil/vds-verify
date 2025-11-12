import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { setBackgroundColorAsync } from "expo-system-ui";
import * as NavigationBar from "expo-navigation-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Platform, useColorScheme, StyleSheet } from "react-native";
import { useThemeColor } from "../components/Themed";
import { theme } from "../theme";
import { ScanStatusProvider } from "../contexts/ScanStatusContext";
import { SettingsProvider } from "../contexts/SettingsContext";

export default function RootLayout() {
  const colorScheme = useColorScheme() || "light";

  const tabBarBackgroundColor = useThemeColor(theme.color.background);

  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setButtonStyleAsync(
        colorScheme === "light" ? "dark" : "light"
      );
    }
  }, [colorScheme]);

  // Keep the root view background color in sync with the current theme
  useEffect(() => {
    setBackgroundColorAsync(
      colorScheme === "dark"
        ? theme.color.background.dark
        : theme.color.background.light
    );
  }, [colorScheme]);

  return (
    <SettingsProvider>
      <ScanStatusProvider>
        <GestureHandlerRootView style={styles.container}>
          <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
          >
            <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="(modals)" options={{ headerShown: false }} />
            </Stack>
          </ThemeProvider>
        </GestureHandlerRootView>
      </ScanStatusProvider>
    </SettingsProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
