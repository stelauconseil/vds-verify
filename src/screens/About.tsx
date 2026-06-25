import { FC } from "react";
import { StyleSheet, View, Text, ScrollView, Linking, Platform } from "react-native";
import * as Application from "expo-application";
import { useEffectiveColorScheme } from "@/contexts/SettingsContext";
import { useSettings } from "@/contexts/SettingsContext";
import { getLabel } from "@/components/Label";

const lightColors = {
    screen: "#F2F2F7",
    section: "#FFFFFF",
    label: "#000000",
    value: "#8E8E93",
    separator: "#C6C6C8",
    appName: "#000000",
    link: "#007AFF",
};
const darkColors: typeof lightColors = {
    screen: "#000000",
    section: "#1C1C1E",
    label: "#FFFFFF",
    value: "#8E8E93",
    separator: "#38383A",
    appName: "#FFFFFF",
    link: "#0A84FF",
};

type Row = { label: string; value?: string; onPress?: () => void };

function InfoSection({ rows, colors }: { rows: Row[]; colors: typeof lightColors }) {
    return (
        <View style={[styles.section, { backgroundColor: colors.section }]}>
            {rows.map((row, i) => (
                <View key={row.label}>
                    <View style={styles.row}>
                        <Text style={[styles.rowLabel, { color: colors.label }]}>
                            {row.label}
                        </Text>
                        <Text
                            style={[
                                styles.rowValue,
                                { color: row.onPress ? colors.link : colors.value },
                            ]}
                            onPress={row.onPress}
                            numberOfLines={1}
                        >
                            {row.value ?? ""}
                        </Text>
                    </View>
                    {i < rows.length - 1 && (
                        <View
                            style={[
                                styles.separator,
                                { backgroundColor: colors.separator },
                            ]}
                        />
                    )}
                </View>
            ))}
        </View>
    );
}

const About: FC = () => {
    const scheme = useEffectiveColorScheme();
    const colors = scheme === "dark" ? darkColors : lightColors;
    const { lang } = useSettings();

    const version = Application.nativeApplicationVersion ?? "";
    const build = Application.nativeBuildVersion ?? "";
    const bundleId = Application.applicationId ?? "com.stelau.vdsverify";
    const year = new Date().getFullYear();
    const copyright = getLabel("about_copyright", lang).replace("{year}", String(year));

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: colors.screen }}
            contentContainerStyle={styles.content}
        >
            {/* App name header */}
            <View style={styles.header}>
                <Text style={[styles.appName, { color: colors.appName }]}>
                    {Application.applicationName}
                </Text>
                <Text style={[styles.appVersion, { color: colors.value }]}>
                    {getLabel("Version", lang)} {version}
                </Text>
            </View>

            {/* Version details */}
            <InfoSection
                colors={colors}
                rows={[
                    { label: getLabel("Version", lang), value: version },
                    { label: getLabel("about_build", lang), value: build },
                    ...(Platform.OS === "ios"
                        ? [{ label: getLabel("about_bundle_id", lang), value: bundleId }]
                        : [{ label: getLabel("about_package", lang), value: bundleId }]),
                ]}
            />

            {/* Developer */}
            <InfoSection
                colors={colors}
                rows={[
                    {
                        label: getLabel("about_developer", lang),
                        value: "Stelau",
                        onPress: () => Linking.openURL("https://www.stelau.com"),
                    },
                    {
                        label: getLabel("about_website", lang),
                        value: "stelau.com",
                        onPress: () => Linking.openURL("https://www.stelau.com"),
                    },
                ]}
            />

            <Text style={[styles.copyright, { color: colors.value }]}>
                {copyright}
            </Text>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    content: {
        paddingBottom: 40,
    },
    header: {
        alignItems: "center",
        paddingTop: 32,
        paddingBottom: 28,
        gap: 4,
    },
    appName: {
        fontSize: 22,
        fontWeight: "700",
        letterSpacing: 0.2,
    },
    appVersion: {
        fontSize: 15,
    },
    section: {
        marginHorizontal: "5%",
        borderRadius: 12,
        marginBottom: 20,
        overflow: "hidden",
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        minHeight: 44,
    },
    rowLabel: {
        fontSize: 17,
        flexShrink: 0,
    },
    rowValue: {
        fontSize: 17,
        flexShrink: 1,
        textAlign: "right",
        marginLeft: 8,
    },
    separator: {
        height: StyleSheet.hairlineWidth,
        marginLeft: 16,
    },
    copyright: {
        fontSize: 13,
        textAlign: "center",
        marginTop: 8,
        marginHorizontal: "5%",
    },
});

export default About;
