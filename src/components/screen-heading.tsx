import type { ReactNode } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

export const SCREEN_MARGIN = 20;

// Both tab screens share the same title origin and content gutter.
// Side safe areas are applied by the screen; only the top inset belongs here.
export function ScreenHeading({
    title,
    color,
    topInset,
    children,
}: {
    title: string;
    color: string;
    topInset: number;
    children?: ReactNode;
}) {
    return (
        <View style={[styles.container, { paddingTop: topInset + 24 }]}>
            <Text accessibilityRole="header" style={[styles.title, { color }]}>
                {title}
            </Text>
            {children && <View style={styles.actions}>{children}</View>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: SCREEN_MARGIN,
        paddingBottom: 8,
        gap: 12,
    },
    title: {
        fontSize: Platform.OS === "ios" ? 34 : 22,
        fontWeight: "700",
        minHeight: 44,
        textAlign: "left",
    },
    actions: {
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 12,
    },
});
