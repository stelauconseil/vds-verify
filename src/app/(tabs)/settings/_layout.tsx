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
    const screenBg =
        Platform.OS === "ios" && colorSchemePref === "system"
            ? DynamicColorIOS({ light: "#FFFFFF", dark: "#000000" })
            : bg;

    return (
        <View style={[styles.container, { backgroundColor: screenBg as any }]}>
            <Stack
                screenOptions={{
                    headerTitleAlign: "center",
                    headerBackButtonDisplayMode: "minimal",
                    contentStyle: { backgroundColor: screenBg },
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
