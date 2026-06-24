import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "expo-router/react-navigation";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as SystemUI from "expo-system-ui";
import * as NavigationBar from "expo-navigation-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Platform, StyleSheet } from "react-native";
import { theme } from "@/theme";
import { ScanStatusProvider } from "@/contexts/ScanStatusContext";
import {
    SettingsProvider,
    useEffectiveColorScheme,
} from "@/contexts/SettingsContext";

export default function RootLayout() {
    return (
        <SettingsProvider>
            <ScanStatusProvider>
                <AppLayout />
            </ScanStatusProvider>
        </SettingsProvider>
    );
}

function AppLayout() {
    const colorScheme = useEffectiveColorScheme();
    const [iconsReady] = useFonts(Ionicons.font);

    useEffect(() => {
        if (Platform.OS === "android") {
            if (typeof NavigationBar.setStyle === "function") {
                try {
                    NavigationBar.setStyle(
                        colorScheme === "light" ? "dark" : "light",
                    );
                } catch {
                    // Ignore environments where navigation bar APIs are unavailable.
                }
            }
        }
    }, [colorScheme]);

    // Keep the root view background color in sync with the current theme
    useEffect(() => {
        if (typeof SystemUI.setBackgroundColorAsync === "function") {
            SystemUI.setBackgroundColorAsync(
                colorScheme === "dark"
                    ? theme.color.background.dark
                    : theme.color.background.light,
            ).catch(() => {
                // Ignore environments where system UI APIs are unavailable.
            });
        }
    }, [colorScheme]);

    if (!iconsReady) {
        return null;
    }

    return (
        <GestureHandlerRootView
            style={[
                styles.container,
                {
                    backgroundColor:
                        colorScheme === "dark"
                            ? theme.color.background.dark
                            : theme.color.background.light,
                },
            ]}
        >
            <ThemeProvider
                value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
            >
                <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
                <Stack
                    screenOptions={{
                        headerShown: false,
                        contentStyle: {
                            backgroundColor:
                                colorScheme === "dark"
                                    ? theme.color.background.dark
                                    : theme.color.background.light,
                        },
                    }}
                >
                    <Stack.Screen
                        name="(tabs)"
                        options={{ headerShown: false }}
                    />
                </Stack>
            </ThemeProvider>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
