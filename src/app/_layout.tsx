import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { setBackgroundColorAsync } from "expo-system-ui";
import * as NavigationBar from "expo-navigation-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Platform, StyleSheet } from "react-native";
import { useThemeColor } from "@/components/Themed";
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

    const tabBarBackgroundColor = useThemeColor(theme.color.background);

    useEffect(() => {
        if (Platform.OS === "android") {
            NavigationBar.setButtonStyleAsync(
                colorScheme === "light" ? "dark" : "light",
            );
        }
    }, [colorScheme]);

    // Keep the root view background color in sync with the current theme
    useEffect(() => {
        setBackgroundColorAsync(
            colorScheme === "dark"
                ? theme.color.background.dark
                : theme.color.background.light,
        );
    }, [colorScheme]);

    return (
        <GestureHandlerRootView style={[styles.container, { backgroundColor: colorScheme === "dark" ? theme.color.background.dark : theme.color.background.light }]}>
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
