import { FC, useState, useCallback, useEffect, useRef } from "react";
import {
  FlatList,
  View,
  StyleSheet,
  Text,
  Alert,
  Pressable,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { formatData, getLabel } from "@/components/Label";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Swipeable } from "react-native-gesture-handler";

type HistoryEntry = { timestamp: string; data: any };
type Props = { navigation: any; lang: string };

const ROW_BG_1 = "#F7F9FC"; // very light blue-gray
const ROW_BG_2 = "#EEF2F7"; // slightly darker
const FULL_SWIPE_MIN_PX = 160;
const FULL_SWIPE_MAX_PX = 240;

type HistoryRowProps = {
  item: HistoryEntry;
  index: number;
  lang: string;
  navigation: any;
  openSwipeableRef: React.MutableRefObject<any>;
  deleteHistoryEntryImmediate: (timestamp: string) => void;
};

const HistoryRow: FC<HistoryRowProps> = ({
  item,
  index,
  lang,
  navigation,
  openSwipeableRef,
  deleteHistoryEntryImmediate,
}) => {
  const swipeableRowRef = useRef<any>(null);
  const dragListenerIdRef = useRef<string | null>(null);
  const fullSwipeArmedRef = useRef(false);

  const measuredHeightRef = useRef<number | null>(null);
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const [hasMeasured, setHasMeasured] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const cleanupDragListener = useCallback(() => {
    const row = swipeableRowRef.current;
    const id = dragListenerIdRef.current;
    try {
      if (id && row?.state?.dragX?.removeListener) {
        row.state.dragX.removeListener(id);
      }
    } catch {
      // no-op
    }
    dragListenerIdRef.current = null;
    fullSwipeArmedRef.current = false;
  }, []);

  useEffect(() => cleanupDragListener, [cleanupDragListener]);

  const getFullSwipeActivationDistance = useCallback(() => {
    const row = swipeableRowRef.current;
    const rowWidth = row?.state?.rowWidth as number | undefined;
    if (typeof rowWidth === "number" && rowWidth > 0) {
      const scaled = rowWidth * 0.6;
      return Math.min(FULL_SWIPE_MAX_PX, Math.max(FULL_SWIPE_MIN_PX, scaled));
    }
    return FULL_SWIPE_MIN_PX;
  }, []);

  const onDelete = useCallback(() => {
    if (isDeleting) return;

    setIsDeleting(true);
    cleanupDragListener();

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
    cleanupDragListener,
    deleteHistoryEntryImmediate,
    isDeleting,
    item.timestamp,
    openSwipeableRef,
    opacity,
    translateX,
  ]);

  const typeField = item.data?.header?.["Type de document"] as
    | string
    | { [code: string]: string }
    | undefined;

  let localizedType: string | undefined;
  if (typeField && typeof typeField === "object") {
    const lowerLang = lang?.toLowerCase();
    localizedType =
      typeField[lowerLang] ||
      typeField[lowerLang?.slice(0, 2) || ""] ||
      Object.values(typeField)[0];
  } else if (typeof typeField === "string") {
    localizedType = typeField;
  }

  const docType = localizedType
    ? (() => {
        const trimmed = localizedType.trim();
        if (!trimmed) return "";
        return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
      })()
    : undefined;
  const manifest = item.data?.header?.["manifest_ID"] as string | undefined;
  const date = (formatData(item.timestamp, lang) as string) || "";

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
          if (!hasMeasured && h > 0) {
            measuredHeightRef.current = h;
            animatedHeight.setValue(h);
            setHasMeasured(true);
          }
        }}
      >
        <Animated.View style={{ opacity, transform: [{ translateX }] }}>
          <Swipeable
            ref={swipeableRowRef}
            friction={2}
            rightThreshold={40}
            overshootRight
            overshootFriction={8}
            onSwipeableWillOpen={() => {
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
              cleanupDragListener();
              if (openSwipeableRef.current === swipeableRowRef.current) {
                openSwipeableRef.current = null;
              }
            }}
            onSwipeableOpenStartDrag={(direction) => {
              if (direction !== "right") return;

              cleanupDragListener();
              const row = swipeableRowRef.current;
              const dragX = row?.state?.dragX;
              if (dragX?.addListener) {
                dragListenerIdRef.current = dragX.addListener(
                  ({ value }: { value: number }) => {
                    if (value <= -getFullSwipeActivationDistance()) {
                      fullSwipeArmedRef.current = true;
                    }
                  },
                );
              }
            }}
            onSwipeableOpen={(direction) => {
              if (direction !== "right") return;
              const shouldAutoDelete = fullSwipeArmedRef.current;
              cleanupDragListener();
              if (shouldAutoDelete) onDelete();
            }}
            renderRightActions={() => (
              <Pressable
                onPress={onDelete}
                style={styles.deleteAction}
                accessibilityRole="button"
                accessibilityLabel={getLabel("delete", lang)}
              >
                <Ionicons name="trash" size={20} color="#fff" />
                <Text style={styles.deleteActionText}>
                  {getLabel("delete", lang)}
                </Text>
              </Pressable>
            )}
          >
            <Pressable
              onPress={() => {
                swipeableRowRef.current?.close();
                if (openSwipeableRef.current === swipeableRowRef.current) {
                  openSwipeableRef.current = null;
                }
                navigation.navigate("result", { result: item.data });
              }}
              style={{
                backgroundColor: index % 2 === 0 ? ROW_BG_1 : ROW_BG_2,
                padding: 12,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: "#0F172A",
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
                    color: "#374151",
                    fontSize: 12,
                    marginTop: 2,
                  }}
                >
                  {date}
                </Text>
              </View>
            </Pressable>
          </Swipeable>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const HistoryScreen: FC<Props> = ({ navigation, lang }) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const insets = useSafeAreaInsets();
  const openSwipeableRef = useRef<any>(null);

  useEffect(() => {
    if (
      Platform.OS === "android" &&
      typeof UIManager.setLayoutAnimationEnabledExperimental === "function"
    ) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchHistory = async () => {
        const storedHistory = JSON.parse(
          (await AsyncStorage.getItem("scanHistory")) || "[]",
        ) as HistoryEntry[];
        setHistory(storedHistory);
      };
      fetchHistory();
    }, []),
  );

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

  const renderItem = useCallback(
    ({ item, index }: { item: HistoryEntry; index: number }) => (
      <HistoryRow
        item={item}
        index={index}
        lang={lang}
        navigation={navigation}
        openSwipeableRef={openSwipeableRef}
        deleteHistoryEntryImmediate={deleteHistoryEntryImmediate}
      />
    ),
    [deleteHistoryEntryImmediate, lang, navigation],
  );

  return (
    <View style={styles.container}>
      {/* Title header with safe area top inset and trash icon */}
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: "5%",
          paddingBottom: 8,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text style={styles.title}>{getLabel("history", lang)}</Text>
        {history.length > 0 && (
          <BlurView
            intensity={70}
            tint="light"
            style={{ borderRadius: 18, overflow: "hidden" }}
          >
            <Pressable
              onPress={() =>
                Alert.alert(
                  getLabel("deleteHistory", lang) || "Clear history",
                  getLabel("deleteHistoryMessage", lang) ||
                    "Do you really want to delete all history entries?",
                  [
                    {
                      text: getLabel("cancel", lang) || "Cancel",
                      style: "cancel",
                    },
                    {
                      text: getLabel("ok", lang) || "Ok",
                      style: "destructive",
                      onPress: () => void deleteHistory(),
                    },
                  ],
                  { cancelable: true },
                )
              }
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={getLabel("deleteHistory", lang)}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(255,255,255,0.3)",
                }}
              >
                <Ionicons name="trash" size={20} color="#6b7280" />
              </View>
            </Pressable>
          </BlurView>
        )}
      </View>
      <FlatList
        style={styles.center}
        contentContainerStyle={{
          paddingTop: 8,
          paddingHorizontal: "5%",
          paddingBottom: Math.max(insets.bottom, 8) + 8 + 70,
        }}
        data={history}
        keyExtractor={(item) => item.timestamp}
        renderItem={renderItem}
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
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
  },
  center: { flex: 1 },
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
