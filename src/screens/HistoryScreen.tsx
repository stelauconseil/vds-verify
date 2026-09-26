import { filterHistory, type HistoryFilter } from "@/types/history-filter";
import { Host, TextInput, Picker, type TextInputRef } from "@expo/ui";
import { screenshotsEnabled } from "@/screenshots";
import { testResults } from "@/testdata";
import { getLocalizedDocumentType } from "@/types/document-type";
import { ScreenHeading, SCREEN_MARGIN } from "@/components/screen-heading";
import { FC, useState, useCallback, useEffect, useMemo, useRef } from "react";
import {
    FlatList,
    View,
    StyleSheet,
    Text,
    Alert,
    Pressable,
    Animated,
    LayoutAnimation,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { formatData, getLabel } from "@/components/Label";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import Swipeable, {
    type SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import type { SharedValue } from "react-native-reanimated";
import { useEffectiveColorScheme } from "@/contexts/SettingsContext";

type HistoryEntry = { timestamp: string; data: any; pinned?: boolean };
type Props = { navigation: any; lang: string; isFocused?: boolean };

const ROW_BG_LIGHT_1 = "#F7F9FC";
const ROW_BG_LIGHT_2 = "#EEF2F7";
const ROW_BG_DARK_1 = "#1C1C1E";
const ROW_BG_DARK_2 = "#2C2C2E";
const FULL_SWIPE_MIN_PX = 160;
const FULL_SWIPE_MAX_PX = 240;

function formatDocumentTypeTitle(value: unknown): string | undefined {
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    if (!trimmed) return "";
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

type HistoryRowProps = {
    item: HistoryEntry;
    index: number;
    lang: string;
    navigation: any;
    openSwipeableRef: React.MutableRefObject<any>;
    deleteHistoryEntryImmediate: (timestamp: string) => void;
    togglePinned: (timestamp: string) => void;
};

const HistoryRow: FC<HistoryRowProps> = ({
    item,
    index,
    lang,
    navigation,
    openSwipeableRef,
    deleteHistoryEntryImmediate,
    togglePinned,
}) => {
    const swipeableRowRef = useRef<SwipeableMethods | null>(null);
    const dragTranslationRef = useRef<SharedValue<number> | null>(null);
    const rowWidthRef = useRef(0);
    const scheme = useEffectiveColorScheme();
    const rowBg1 = scheme === "dark" ? ROW_BG_DARK_1 : ROW_BG_LIGHT_1;
    const rowBg2 = scheme === "dark" ? ROW_BG_DARK_2 : ROW_BG_LIGHT_2;
    const rowTextPrimary = scheme === "dark" ? "#F9FAFB" : "#0F172A";
    const rowTextSecondary = scheme === "dark" ? "#9CA3AF" : "#374151";

    const measuredHeightRef = useRef<number | null>(null);
    const animatedHeight = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(1)).current;
    const translateX = useRef(new Animated.Value(0)).current;
    const [hasMeasured, setHasMeasured] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const onDelete = useCallback(() => {
        if (isDeleting) return;

        setIsDeleting(true);

        const row = swipeableRowRef.current;
        row?.close?.();
        if (openSwipeableRef.current === row) {
            openSwipeableRef.current = null;
        }

        const height = measuredHeightRef.current ?? 0;
        if (height > 0) {
            animatedHeight.setValue(height);
        }

        Animated.sequence([
            Animated.parallel([
                Animated.timing(translateX, {
                    toValue: -24,
                    duration: 120,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 160,
                    useNativeDriver: true,
                }),
            ]),
            // Height cannot be driven by native driver; animate it on an outer wrapper.
            Animated.timing(animatedHeight, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false,
            }),
        ]).start(({ finished }) => {
            if (finished) {
                deleteHistoryEntryImmediate(item.timestamp);
            }
        });
    }, [
        animatedHeight,
        deleteHistoryEntryImmediate,
        isDeleting,
        item.timestamp,
        openSwipeableRef,
        opacity,
        translateX,
    ]);

    const localizedType = getLocalizedDocumentType(
        item.data?.header?.["Type de document"],
        lang,
    );
    const docType = formatDocumentTypeTitle(localizedType);
    const manifest = item.data?.header?.["manifest_ID"] as string | undefined;
    const date = (() => {
        const languageTag = getLabel("languageTag", lang);
        const parsed = Date.parse(item.timestamp);
        if (!Number.isNaN(parsed) && parsed > 1000) {
            const d = new Date(parsed);
            if (d.toString() !== "Invalid Date") {
                const dateString = d.toLocaleDateString(languageTag);
                const hasTime =
                    d.getHours() !== 0 ||
                    d.getMinutes() !== 0 ||
                    d.getSeconds() !== 0;
                if (hasTime) {
                    return `${dateString} ${d.toLocaleTimeString(languageTag)}`;
                }
                return dateString;
            }
        }
        return (formatData(item.timestamp, lang) as string) || "";
    })();

    return (
        <Animated.View
            style={{
                borderRadius: 12,
                overflow: "hidden",
                marginBottom: 10,
                ...(hasMeasured ? { height: animatedHeight } : null),
            }}
            pointerEvents={isDeleting ? "none" : "auto"}
        >
            <View
                onLayout={(e) => {
                    const h = e.nativeEvent.layout.height;
                    rowWidthRef.current = e.nativeEvent.layout.width;
                    if (!isDeleting && h > 0) {
                        measuredHeightRef.current = h;
                        animatedHeight.setValue(h);
                        setHasMeasured(true);
                    }
                }}
            >
                <Animated.View style={{ opacity, transform: [{ translateX }] }}>
                    <Swipeable
                        ref={swipeableRowRef}
                        friction={1}
                        rightThreshold={40}
                        overshootRight
                        overshootFriction={1}
                        onSwipeableWillOpen={(direction) => {
                            const threshold = Math.min(
                                FULL_SWIPE_MAX_PX,
                                Math.max(
                                    FULL_SWIPE_MIN_PX,
                                    rowWidthRef.current * 0.6,
                                ),
                            );
                            if (
                                direction === "left" &&
                                (dragTranslationRef.current?.get() ?? 0) <=
                                    -threshold
                            ) {
                                onDelete();
                                return;
                            }
                            const row = swipeableRowRef.current;
                            if (
                                openSwipeableRef.current &&
                                openSwipeableRef.current !== row
                            ) {
                                openSwipeableRef.current.close();
                            }
                            openSwipeableRef.current = row;
                        }}
                        onSwipeableWillClose={() => {
                            if (
                                openSwipeableRef.current ===
                                swipeableRowRef.current
                            ) {
                                openSwipeableRef.current = null;
                            }
                        }}
                        renderRightActions={(_progress, translation) => {
                            dragTranslationRef.current = translation;
                            return (
                                <Pressable
                                    onPress={onDelete}
                                    style={styles.deleteAction}
                                    accessibilityRole="button"
                                    accessibilityLabel={getLabel(
                                        "delete",
                                        lang,
                                    )}
                                >
                                    <Ionicons
                                        name="trash"
                                        size={20}
                                        color="#fff"
                                    />
                                    <Text style={styles.deleteActionText}>
                                        {getLabel("delete", lang)}
                                    </Text>
                                </Pressable>
                            );
                        }}
                    >
                        <Pressable
                            onPress={() => {
                                swipeableRowRef.current?.close();
                                if (
                                    openSwipeableRef.current ===
                                    swipeableRowRef.current
                                ) {
                                    openSwipeableRef.current = null;
                                }
                                navigation.navigate("result", {
                                    result: item.data,
                                });
                            }}
                            style={{
                                backgroundColor:
                                    index % 2 === 0 ? rowBg1 : rowBg2,
                                padding: 12,
                            }}
                        >
                            <View
                                style={{
                                    flex: 1,
                                    flexDirection: "row",
                                    gap: 8,
                                }}
                            >
                                <View style={{ flex: 1 }}>
                                    <Text
                                        style={{
                                            color: rowTextPrimary,
                                            fontSize: 16,
                                            fontWeight: "700",
                                        }}
                                    >
                                        {docType
                                            ? docType
                                            : `${getLabel("manifest_ID", lang)}: ${manifest ?? ""}`}
                                    </Text>
                                    <Text
                                        style={{
                                            color: rowTextSecondary,
                                            fontSize: 12,
                                            marginTop: 2,
                                        }}
                                    >
                                        {date}
                                    </Text>
                                </View>
                                <Pressable
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        togglePinned(item.timestamp);
                                    }}
                                    hitSlop={10}
                                    accessibilityRole="button"
                                    accessibilityLabel={
                                        item.pinned
                                            ? getLabel("unpin_entry", lang)
                                            : getLabel("pin_entry", lang)
                                    }
                                    style={{
                                        width: 28,
                                        height: 28,
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Ionicons
                                        name={
                                            item.pinned
                                                ? "star"
                                                : "star-outline"
                                        }
                                        size={20}
                                        color={
                                            item.pinned
                                                ? "#F59E0B"
                                                : rowTextSecondary
                                        }
                                    />
                                </Pressable>
                            </View>
                        </Pressable>
                    </Swipeable>
                </Animated.View>
            </View>
        </Animated.View>
    );
};

const HistoryScreen: FC<Props> = ({ navigation, lang, isFocused = true }) => {
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [filter, setFilter] = useState<HistoryFilter>("all");
    const [query, setQuery] = useState("");
    const searchRef = useRef<TextInputRef>(null);
    const insets = useSafeAreaInsets();
    const openSwipeableRef = useRef<any>(null);
    const scheme = useEffectiveColorScheme();
    const containerBg = scheme === "dark" ? "#000000" : "#FFFFFF";
    const titleColor = scheme === "dark" ? "#F9FAFB" : "#0F172A";

    useEffect(() => {
        if (isFocused) {
            const fetchHistory = async () => {
                const storedHistory = JSON.parse(
                    (await AsyncStorage.getItem("scanHistory")) || "[]",
                ) as HistoryEntry[];
                setHistory(storedHistory);
            };
            fetchHistory();
        }
    }, [isFocused]);

    const deleteHistory = async () => {
        try {
            await AsyncStorage.removeItem("scanHistory");

            LayoutAnimation.configureNext({
                duration: 220,
                create: {
                    type: LayoutAnimation.Types.easeInEaseOut,
                    property: LayoutAnimation.Properties.opacity,
                },
                update: { type: LayoutAnimation.Types.easeInEaseOut },
                delete: {
                    type: LayoutAnimation.Types.easeInEaseOut,
                    property: LayoutAnimation.Properties.opacity,
                },
            });
            setHistory([]);
        } catch (error) {
            console.error("Failed to delete history:", error);
        }
    };

    const deleteHistoryEntryImmediate = useCallback((timestamp: string) => {
        setHistory((prev) => {
            const next = prev.filter((e) => e.timestamp !== timestamp);
            void AsyncStorage.setItem("scanHistory", JSON.stringify(next));
            return next;
        });
    }, []);

    const togglePinned = useCallback((timestamp: string) => {
        setHistory((prev) => {
            const next = prev.map((entry) =>
                entry.timestamp === timestamp
                    ? { ...entry, pinned: !entry.pinned }
                    : entry,
            );
            void AsyncStorage.setItem("scanHistory", JSON.stringify(next));
            return next;
        });
    }, []);

    const displayedHistory = useMemo(
        () =>
            filterHistory(
                history,
                query,
                filter,
                getLabel("languageTag", lang),
            ),
        [history, query, filter, lang],
    );
    useEffect(() => {
        openSwipeableRef.current?.close();
        openSwipeableRef.current = null;
    }, [query, filter]);
    const resetFilters = () => {
        searchRef.current?.clear();
        setQuery("");
        setFilter("all");
    };

    const renderItem = useCallback(
        ({ item, index }: { item: HistoryEntry; index: number }) => (
            <HistoryRow
                item={item}
                index={index}
                lang={lang}
                navigation={navigation}
                openSwipeableRef={openSwipeableRef}
                deleteHistoryEntryImmediate={deleteHistoryEntryImmediate}
                togglePinned={togglePinned}
            />
        ),
        [deleteHistoryEntryImmediate, lang, navigation, togglePinned],
    );

    return (
        <View
            testID="history-screen"
            style={[
                styles.container,
                {
                    backgroundColor: containerBg,
                    paddingLeft: insets.left,
                    paddingRight: insets.right,
                },
            ]}
        >
            <ScreenHeading
                title={getLabel("history", lang)}
                color={titleColor}
                topInset={insets.top}
            >
                {__DEV__ && !screenshotsEnabled && (
                    <Pressable
                        onPress={async () => {
                            const entries = testResults.map((data, i) => ({
                                timestamp: new Date(
                                    Date.now() - i * 3_600_000,
                                ).toISOString(),
                                pinned: false,
                                data,
                            }));
                            await AsyncStorage.setItem(
                                "scanHistory",
                                JSON.stringify(entries),
                            );
                            setHistory(entries);
                        }}
                        hitSlop={10}
                    >
                        <Text
                            style={{
                                color: "#007AFF",
                                fontSize: 13,
                                fontWeight: "600",
                            }}
                        >
                            Seed
                        </Text>
                    </Pressable>
                )}
                {history.length > 0 && (
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 8,
                        }}
                    >
                        <BlurView
                            intensity={70}
                            tint={scheme === "dark" ? "dark" : "light"}
                            style={{ borderRadius: 18, overflow: "hidden" }}
                        >
                            <Pressable
                                onPress={() =>
                                    Alert.alert(
                                        getLabel("deleteHistory", lang) ||
                                            "Clear history",
                                        getLabel(
                                            "deleteHistoryMessage",
                                            lang,
                                        ) ||
                                            "Do you really want to delete all history entries?",
                                        [
                                            {
                                                text:
                                                    getLabel("cancel", lang) ||
                                                    "Cancel",
                                                style: "cancel",
                                            },
                                            {
                                                text:
                                                    getLabel("ok", lang) ||
                                                    "Ok",
                                                style: "destructive",
                                                onPress: () =>
                                                    void deleteHistory(),
                                            },
                                        ],
                                        { cancelable: true },
                                    )
                                }
                                hitSlop={10}
                                accessibilityRole="button"
                                accessibilityLabel={getLabel(
                                    "deleteHistory",
                                    lang,
                                )}
                            >
                                <View
                                    style={{
                                        width: 36,
                                        height: 36,
                                        alignItems: "center",
                                        justifyContent: "center",
                                        backgroundColor:
                                            scheme === "dark"
                                                ? "rgba(255,255,255,0.1)"
                                                : "rgba(255,255,255,0.3)",
                                    }}
                                >
                                    <Ionicons
                                        name="trash"
                                        size={20}
                                        color={
                                            scheme === "dark"
                                                ? "#E5E7EB"
                                                : "#6b7280"
                                        }
                                    />
                                </View>
                            </Pressable>
                        </BlurView>
                    </View>
                )}
            </ScreenHeading>
            <View style={{ paddingHorizontal: SCREEN_MARGIN, gap: 8 }}>
                <Host matchContents={{ vertical: true }} colorScheme={scheme}>
                    <TextInput
                        ref={searchRef}
                        testID="history-search"
                        placeholder={getLabel("history_search", lang)}
                        onChangeText={setQuery}
                        autoCorrect={false}
                        autoCapitalize="none"
                        returnKeyType="search"
                        onSubmitEditing={() => searchRef.current?.blur()}
                    />
                </Host>
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 12,
                    }}
                >
                    <Text style={{ color: titleColor }}>
                        {displayedHistory.length} / {history.length}
                    </Text>
                    <Host matchContents colorScheme={scheme}>
                        <Picker<HistoryFilter>
                            testID="history-filter"
                            selectedValue={filter}
                            onValueChange={setFilter}
                        >
                            {(["all", "pinned", "review"] as const).map(
                                (value) => (
                                    <Picker.Item
                                        key={value}
                                        value={value}
                                        label={getLabel(
                                            `history_filter_${value}`,
                                            lang,
                                        )}
                                    />
                                ),
                            )}
                        </Picker>
                    </Host>
                    {(query.length > 0 || filter !== "all") && (
                        <Pressable
                            testID="history-reset"
                            accessibilityRole="button"
                            onPress={resetFilters}
                            style={{ minHeight: 44, justifyContent: "center" }}
                        >
                            <Text
                                style={{
                                    color:
                                        scheme === "dark"
                                            ? "#60A5FA"
                                            : "#0069b4",
                                }}
                            >
                                {getLabel("history_reset", lang)}
                            </Text>
                        </Pressable>
                    )}
                </View>
                {filter === "review" && (
                    <Text style={{ color: titleColor }}>
                        {getLabel("history_review_help", lang)}
                    </Text>
                )}
            </View>
            <FlatList
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                style={styles.center}
                contentContainerStyle={{
                    paddingTop: 16,
                    paddingHorizontal: SCREEN_MARGIN,
                    paddingBottom: Math.max(insets.bottom, 8) + 8 + 70,
                    flexGrow: 1,
                }}
                data={displayedHistory}
                keyExtractor={(item) => item.timestamp}
                renderItem={renderItem}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>
                            {getLabel(
                                history.length
                                    ? "history_no_matches"
                                    : "nohistory",
                                lang,
                            )}
                        </Text>
                    </View>
                }
                onScrollBeginDrag={() => {
                    openSwipeableRef.current?.close();
                    openSwipeableRef.current = null;
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    center: { flex: 1 },
    emptyState: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    emptyStateText: {
        color: "#6B7280",
        fontSize: 16,
        fontWeight: "600",
        textAlign: "center",
    },
    deleteAction: {
        width: 96,
        backgroundColor: "#FF3B30",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
    },
    deleteActionText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "700",
    },
    button: {
        backgroundColor: "#0069b4",
        borderWidth: 2,
        borderColor: "#0069b4",
        borderRadius: 10,
    },
    buttonTitle: {
        fontSize: 16,
        textAlign: "center",
        color: "white",
        padding: 10,
    },
    listTop: {},
    listMiddle: {},
    listBotton: {},
});

export default HistoryScreen;
