import { Platform, Pressable, StyleSheet, View } from "react-native";
import * as Linking from "expo-linking";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ThemedText, useThemeColor } from "@/components/Themed";
import { getLabel } from "@/components/Label";
import { useSettings } from "@/contexts/SettingsContext";
import { theme } from "@/theme";

// Shown when the API answers 426 error_app_outdated.
const STORE_URL =
    Platform.OS === "ios"
        ? "https://apps.apple.com/app/vds-verify/id6463440128"
        : "https://play.google.com/store/apps/details?id=com.stelau.vdsverify";

export default function UpdateRoute() {
    const { lang } = useSettings();
    const textSecondary = useThemeColor(theme.color.textSecondary);

    return (
        <View style={styles.container} testID="update-screen">
            <Ionicons name="cloud-download-outline" size={64} color="#0069b4" />
            <ThemedText
                fontSize={theme.fontSize24}
                fontWeight="bold"
                style={styles.center}
            >
                {getLabel("update_title", lang)}
            </ThemedText>
            <ThemedText style={[styles.center, { color: textSecondary }]}>
                {getLabel("error_app_outdated", lang)}
            </ThemedText>
            <Pressable
                accessibilityRole="button"
                testID="update-store"
                style={styles.button}
                onPress={() => void Linking.openURL(STORE_URL)}
            >
                <ThemedText fontWeight="semiBold" style={styles.buttonText}>
                    {getLabel(
                        Platform.OS === "ios"
                            ? "update_app_store"
                            : "update_play_store",
                        lang,
                    )}
                </ThemedText>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: theme.space16,
        padding: theme.space24,
    },
    center: { textAlign: "center" },
    button: {
        minHeight: 48,
        justifyContent: "center",
        paddingHorizontal: theme.space24,
        borderRadius: 12,
        backgroundColor: "#0069b4",
    },
    buttonText: { color: "#FFFFFF" },
});
