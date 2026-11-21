import { useCallback, useRef, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BottomSheet, RNHostView } from "@expo/ui";
import {
  BottomSheet as SwiftUIBottomSheet,
  Group,
  Host,
} from "@expo/ui/swift-ui";
import {
  padding,
  presentationDragIndicator,
} from "@expo/ui/swift-ui/modifiers";

import { getLabel } from "@/components/Label";
import { useEffectiveColorScheme } from "@/contexts/SettingsContext";
import { systemColor, theme } from "@/theme";

export type DocumentSource = "camera" | "photo" | "file";

const SOURCES: {
  source: DocumentSource;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { source: "camera", icon: "scan-outline" },
  { source: "photo", icon: "images-outline" },
  { source: "file", icon: "document-outline" },
];

// Bottom sheet offering the Document tab's sources. `choose()` resolves with the picked source,
// or null when the sheet is swiped away (or Back on Android). On iOS it resolves once the sheet
// is fully dismissed: the scanner or a picker presented earlier would fail to show.
export function useDocumentSourceSheet(lang?: string) {
  const scheme = useEffectiveColorScheme();
  const [open, setOpen] = useState(false);
  const pending = useRef<{
    resolve: (source: DocumentSource | null) => void;
    source: DocumentSource | null;
  } | null>(null);

  const choose = useCallback(
    () =>
      new Promise<DocumentSource | null>((resolve) => {
        pending.current = { resolve, source: null };
        setOpen(true);
      }),
    [],
  );
  const finish = useCallback(() => {
    const p = pending.current;
    pending.current = null;
    p?.resolve(p.source);
  }, []);
  const pick = (source: DocumentSource) => {
    if (pending.current) pending.current.source = source;
    setOpen(false);
    if (Platform.OS !== "ios") finish();
  };

  const color = systemColor("label", theme.color.text[scheme]);
  // RNHostView: React Native content inside the native sheet (touches included).
  const rows = (
    <RNHostView matchContents={{ vertical: true }}>
      <View style={styles.rows}>
        {SOURCES.map(({ source, icon }) => (
          <Pressable
            key={source}
            accessibilityRole="button"
            testID={`document-source-${source}`}
            onPress={() => pick(source)}
            style={({ pressed }) => [
              styles.row,
              pressed && {
                backgroundColor:
                  scheme === "dark"
                    ? theme.darkActiveContent
                    : theme.lightActiveContent,
              },
            ]}
          >
            <Ionicons name={icon} size={24} color={color as string} />
            <Text style={[styles.label, { color }]}>
              {getLabel(`document_${source}`, lang)}
            </Text>
          </Pressable>
        ))}
      </View>
    </RNHostView>
  );

  const sheet =
    Platform.OS === "ios" ? (
      <Host style={{ position: "absolute" }} pointerEvents="none">
        <SwiftUIBottomSheet
          isPresented={open}
          onIsPresentedChange={setOpen}
          onDismiss={finish}
          fitToContents
        >
          <Group
            modifiers={[
              padding({ top: 24, leading: 16, trailing: 16 }),
              presentationDragIndicator("visible"),
            ]}
          >
            {rows}
          </Group>
        </SwiftUIBottomSheet>
      </Host>
    ) : (
      <BottomSheet
        isPresented={open}
        onDismiss={() => {
          setOpen(false);
          finish();
        }}
        containerColor={theme.color.backgroundSecondary[scheme]}
      >
        {rows}
      </BottomSheet>
    );

  return { choose, sheet };
}

const styles = StyleSheet.create({
  rows: { paddingBottom: 16 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  label: { fontSize: 17 },
});
