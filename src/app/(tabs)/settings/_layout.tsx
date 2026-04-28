import { Stack } from "expo-router";
import { Platform, DynamicColorIOS, View, StyleSheet } from "react-native";
import { getLabel } from "@/components/Label";
import {
    useSettings,
    useEffectiveColorScheme,
} from "@/contexts/SettingsContext";

export default function SettingsLayout() {
    const { lang, colorSchemePref } = useSettings();
    const scheme = useEffectiveColorScheme();
    const bg = scheme === "dark" ? "#000000" : "#FFFFFF";
    const headerBg = scheme === "dark" ? "#1C1C1E" : "#F2F2F7";
    const headerText = scheme === "dark" ? "#FFFFFF" : "#000000";
    const screenBg =
        Platform.OS === "ios" && colorSchemePref === "system"
            ? DynamicColorIOS({ light: "#FFFFFF", dark: "#000000" })
            : bg;
    const screenHeaderBg =
        Platform.OS === "ios" && colorSchemePref === "system"
            ? DynamicColorIOS({ light: "#F2F2F7", dark: "#1C1C1E" })
            : headerBg;
    const screenHeaderText =
        Platform.OS === "ios" && colorSchemePref === "system"
            ? DynamicColorIOS({ light: "#000000", dark: "#FFFFFF" })
            : headerText;

    return (
        <View style={[styles.container, { backgroundColor: screenBg as any }]}>
            <Stack
                screenOptions={{
                    headerTitleAlign: "center",
                    headerBackButtonDisplayMode: "minimal",
                    contentStyle: { backgroundColor: screenBg },
                    headerStyle: { backgroundColor: screenHeaderBg as any },
                    headerTitleStyle: { color: screenHeaderText as any },
                    headerTintColor: headerText,
                }}
            >
                <Stack.Screen
                    name="index"
                    options={{
                        title: getLabel("settings", lang),
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="about"
                    options={{ title: getLabel("about", lang) }}
                />
                <Stack.Screen
                    name="faq"
                    options={{ title: getLabel("faq", lang) }}
                />
                <Stack.Screen
                    name="usepolicy"
                    options={{ title: getLabel("usepolicy", lang) }}
                />
                <Stack.Screen
                    name="privacypolicy"
                    options={{ title: getLabel("privacypolicy", lang) }}
                />
            </Stack>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
