import { FC, useEffect } from "react";
import {
    StyleSheet,
    View,
    Text,
    Switch,
    Platform,
    Pressable,
} from "react-native";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLabel } from "@/components/Label";
import {
    useSettings,
    ColorSchemePref,
    useEffectiveColorScheme,
} from "@/contexts/SettingsContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const lightColors = {
    screen: "#F2F2F7",
    section: "#FFFFFF",
    row: "#FFFFFF",
    title: "#0F172A",
    sectionTitle: "#6B7280",
    rowLabel: "#111827",
    rowSubLabel: "#6B7280",
    separator: "#E5E7EB",
    segmentBg: "#E5E7EB",
    segmentText: "#111827",
    icon: "#8E8E93",
    chevron: "#C7C7CC",
};
const darkColors: typeof lightColors = {
    screen: "#000000",
    section: "#1C1C1E",
    row: "#1C1C1E",
    title: "#F9FAFB",
    sectionTitle: "#9CA3AF",
    rowLabel: "#F9FAFB",
    rowSubLabel: "#9CA3AF",
    separator: "#3A3A3C",
    segmentBg: "#3A3A3C",
    segmentText: "#F9FAFB",
    icon: "#8E8E93",
    chevron: "#636366",
};

function makeStyles(c: typeof lightColors) {
    return StyleSheet.create({
        screen: { flex: 1, backgroundColor: c.screen },
        title: {
            fontSize: 22,
            fontWeight: "700",
            color: c.title,
            marginHorizontal: "5%",
            marginBottom: 8,
        },
        sectionTitle: {
            fontSize: 16,
            color: c.sectionTitle,
            marginTop: 24,
            marginBottom: 8,
            marginLeft: "5%",
        },
        section: {
            backgroundColor: c.section,
            borderRadius: 20,
            marginHorizontal: "5%",
            marginTop: 16,
            overflow: "hidden",
        },
        row: {
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            height: 56,
            gap: 12,
            backgroundColor: c.row,
        },
        switch: {
            alignSelf: "center",
            ...(Platform.OS === "ios" ? { marginTop: -1 } : null),
        },
        rowLabel: { fontSize: 16, color: c.rowLabel, flexShrink: 1 },
        rowSubLabel: { fontSize: 13, color: c.rowSubLabel, marginTop: 2 },
        chevron: { marginLeft: "auto" },
        separator: {
            height: StyleSheet.hairlineWidth,
            backgroundColor: c.separator,
            marginLeft: 16 + 22 + 12,
        },
        picker: {
            width: "90%",
            alignSelf: "center",
            borderRadius: 20,
            color: "gray",
            backgroundColor: c.row,
            marginTop: 8,
        },
        pickerItem: { color: "gray", fontSize: 16 },
        segment: {
            flexDirection: "row",
            backgroundColor: c.segmentBg,
            borderRadius: 8,
            padding: 2,
            gap: 4,
        },
        segmentOption: {
            paddingVertical: 4,
            paddingHorizontal: 10,
            borderRadius: 6,
            backgroundColor: "transparent",
        },
        segmentOptionActive: { backgroundColor: "#007AFF" },
        segmentText: { fontSize: 13, color: c.segmentText, fontWeight: "600" },
        segmentTextActive: { color: "#FFFFFF" },
    });
}

type SettingsViewProps = {
    navigation: any;
    lang: string;
    setLang: (l: string) => void;
    isFocused?: boolean;
};

const SettingsView: FC<SettingsViewProps> = ({
    navigation,
    isFocused = true,
}) => {
    const {
        lang,
        setLang,
        historyEnabled,
        setHistoryEnabled,
        advancedMode,
        setAdvancedMode,
        colorSchemePref,
        setColorSchemePref,
    } = useSettings();
    const insets = useSafeAreaInsets();
    const scheme = useEffectiveColorScheme();
    const styles = makeStyles(scheme === "dark" ? darkColors : lightColors);

    useEffect(() => {
        (async () => {
            try {
                const stored = await AsyncStorage.getItem("historyEnabled");
                const enabled = stored !== "false";
                if (enabled !== historyEnabled) {
                    await setHistoryEnabled(enabled);
                }
            } catch {}
        })();
    }, [isFocused]);

    return (
        <View style={styles.screen}>
            {isFocused && (
                <View style={[styles.screen, { paddingTop: insets.top + 8 }]}>
                    {/* Title */}
                    <Text style={styles.title}>
                        {getLabel("settings", lang)}
                    </Text>
                    {/* Info section */}
                    <View style={styles.section}>
                        <Pressable
                            style={styles.row}
                            onPress={() => navigation.navigate("about")}
                        >
                            <Ionicons
                                name="chatbox-ellipses-outline"
                                size={22}
                                color="#8E8E93"
                            />
                            <Text style={styles.rowLabel}>
                                {getLabel("about", lang)}
                            </Text>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color="#C7C7CC"
                                style={styles.chevron}
                            />
                        </Pressable>
                        <View style={styles.separator} />
                        <Pressable
                            style={styles.row}
                            onPress={() => navigation.navigate("faq")}
                        >
                            <Ionicons
                                name="help-circle-outline"
                                size={22}
                                color="#8E8E93"
                            />
                            <Text style={styles.rowLabel}>
                                {getLabel("faq", lang)}
                            </Text>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color="#C7C7CC"
                                style={styles.chevron}
                            />
                        </Pressable>
                        <View style={styles.separator} />
                        <Pressable
                            style={styles.row}
                            onPress={() => navigation.navigate("usepolicy")}
                        >
                            <Ionicons
                                name="receipt-outline"
                                size={22}
                                color="#8E8E93"
                            />
                            <Text style={styles.rowLabel}>
                                {getLabel("usepolicy", lang)}
                            </Text>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color="#C7C7CC"
                                style={styles.chevron}
                            />
                        </Pressable>
                        <View style={styles.separator} />
                        <Pressable
                            style={styles.row}
                            onPress={() => navigation.navigate("privacypolicy")}
                        >
                            <Ionicons
                                name="information-circle-outline"
                                size={22}
                                color="#8E8E93"
                            />
                            <Text style={styles.rowLabel}>
                                {getLabel("privacypolicy", lang)}
                            </Text>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color="#C7C7CC"
                                style={styles.chevron}
                            />
                        </Pressable>
                    </View>

                    {/* History toggle section */}
                    <View style={styles.section}>
                        <View style={styles.row}>
                            <Ionicons
                                name="archive-outline"
                                size={22}
                                color="#8E8E93"
                            />
                            <Text style={styles.rowLabel}>
                                {getLabel("historytoggle", lang)}
                            </Text>
                            <View style={{ flex: 1 }} />
                            <Switch
                                style={styles.switch}
                                value={historyEnabled}
                                onValueChange={setHistoryEnabled}
                                trackColor={{
                                    false: "#D1D5DB",
                                    true: "#34C759",
                                }}
                                thumbColor={
                                    historyEnabled ? "#FFFFFF" : "#FFFFFF"
                                }
                                ios_backgroundColor="#D1D5DB"
                            />
                        </View>
                    </View>

                    {/* Advanced mode toggle */}
                    <View style={styles.section}>
                        <View
                            style={[
                                styles.row,
                                {
                                    height: undefined,
                                    paddingVertical: 12,
                                    alignItems: "center",
                                },
                            ]}
                        >
                            <Ionicons
                                name="code-slash-outline"
                                size={22}
                                color="#8E8E93"
                            />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.rowLabel}>
                                    {getLabel("advancedmode", lang) ||
                                        "Advanced mode"}
                                </Text>
                                <Text style={styles.rowSubLabel}>
                                    {getLabel("advancedmode_info", lang)}
                                </Text>
                            </View>
                            <Switch
                                style={styles.switch}
                                value={advancedMode}
                                onValueChange={setAdvancedMode}
                                trackColor={{
                                    false: "#D1D5DB",
                                    true: "#34C759",
                                }}
                                thumbColor={
                                    advancedMode ? "#FFFFFF" : "#FFFFFF"
                                }
                                ios_backgroundColor="#D1D5DB"
                            />
                        </View>
                    </View>

                    {/* Appearance / theme picker */}
                    <View style={styles.section}>
                        <View
                            style={[
                                styles.row,
                                {
                                    height: undefined,
                                    paddingVertical: 12,
                                    alignItems: "center",
                                },
                            ]}
                        >
                            <Ionicons
                                name="moon-outline"
                                size={22}
                                color="#8E8E93"
                            />
                            <View style={{ flex: 1, gap: 8 }}>
                                <Text style={styles.rowLabel}>
                                    {getLabel("theme", lang)}
                                </Text>
                                <View
                                    style={[
                                        styles.segment,
                                        { alignSelf: "stretch" },
                                    ]}
                                >
                                    {(["system", "light", "dark"] as const).map(
                                        (v) => (
                                            <Pressable
                                                key={v}
                                                accessibilityRole="button"
                                                accessibilityState={{
                                                    selected:
                                                        colorSchemePref === v,
                                                }}
                                                onPress={() =>
                                                    setColorSchemePref(v)
                                                }
                                                style={[
                                                    styles.segmentOption,
                                                    {
                                                        flex: 1,
                                                        alignItems: "center",
                                                    },
                                                    colorSchemePref === v &&
                                                        styles.segmentOptionActive,
                                                ]}
                                            >
                                                <Text
                                                    style={[
                                                        styles.segmentText,
                                                        colorSchemePref === v &&
                                                            styles.segmentTextActive,
                                                    ]}
                                                >
                                                    {getLabel(
                                                        `theme_${v}` as any,
                                                        lang,
                                                    ).toUpperCase()}
                                                </Text>
                                            </Pressable>
                                        ),
                                    )}
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Language picker */}
                    {/* Language selection (compact segmented) */}
                    <View style={styles.section}>
                        <View style={styles.row}>
                            <Ionicons
                                name="globe-outline"
                                size={22}
                                color="#8E8E93"
                            />
                            <Text style={styles.rowLabel}>
                                {getLabel("language", lang)}
                            </Text>
                            <View style={{ flex: 1 }} />
                            <View style={styles.segment}>
                                <Pressable
                                    accessibilityRole="button"
                                    accessibilityState={{
                                        selected: lang === "en",
                                    }}
                                    onPress={() => setLang("en")}
                                    style={[
                                        styles.segmentOption,
                                        lang === "en" &&
                                            styles.segmentOptionActive,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.segmentText,
                                            lang === "en" &&
                                                styles.segmentTextActive,
                                        ]}
                                    >
                                        EN
                                    </Text>
                                </Pressable>
                                <Pressable
                                    accessibilityRole="button"
                                    accessibilityState={{
                                        selected: lang === "fr",
                                    }}
                                    onPress={() => setLang("fr")}
                                    style={[
                                        styles.segmentOption,
                                        lang === "fr" &&
                                            styles.segmentOptionActive,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.segmentText,
                                            lang === "fr" &&
                                                styles.segmentTextActive,
                                        ]}
                                    >
                                        FR
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
};

export default SettingsView;
