import { getLocalizedDocumentType } from "@/types/document-type";
import {
    ReactNode,
    useEffect,
    useMemo,
    useRef,
    useState,
    useCallback,
} from "react";
import {
    View,
    Text,
    Pressable,
    Image,
    Modal,
    Alert,
    AccessibilityInfo,
    Platform,
    StyleSheet,
    useColorScheme,
} from "react-native";
import { Stack, Redirect, useRouter, useLocalSearchParams } from "expo-router";
import Animated, {
    useSharedValue,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useReducedMotion,
} from "react-native-reanimated";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
    Host,
    BottomSheet,
    Column,
    Button,
    Text as NativeText,
} from "@expo/ui";
import { frame, ignoreSafeArea } from "@expo/ui/swift-ui/modifiers";
import { fillMaxWidth } from "@expo/ui/jetpack-compose/modifiers";
import { useHeaderHeight } from "expo-router/react-navigation";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Asset } from "expo-asset";
import { useScanStatus } from "@/contexts/ScanStatusContext";
import { useSettings } from "@/contexts/SettingsContext";
import { getLang, formatData, isBase64, getLabel } from "@/components/Label";
import { normalizeVdsResult } from "@/types/vds";
import { BlurView } from "expo-blur";
import {
    GlassView,
    isLiquidGlassAvailable,
    isGlassEffectAPIAvailable,
} from "expo-glass-effect";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";

// Color palettes for light/dark mode
const lightColors = {
    background: "#FFFFFF",
    backgroundSecondary: "#F7F9FC",
    textPrimary: "#111827",
    textSecondary: "#6B7280",
    border: "#E5E7EB",
    success: "#047857",
    error: "#B91C1C",
    warning: "#92400E",
    primary: "#0069b4",
    buttonBg: "rgba(255,255,255,0.85)",
    buttonIconColor: "#222222",
};
const darkColors: typeof lightColors = {
    background: "#111111",
    backgroundSecondary: "#1C1C1E",
    textPrimary: "#F9FAFB",
    textSecondary: "#9CA3AF",
    border: "#2D3748",
    success: "#10B981",
    error: "#EF4444",
    warning: "#F59E0B",
    primary: "#3B82F6",
    buttonBg: "rgba(30,30,30,0.9)",
    buttonIconColor: "#EEEEEE",
};
type Colors = typeof lightColors;
function useColors(): Colors {
    const { colorSchemePref } = useSettings();
    const system = useColorScheme() ?? "light";
    const scheme = colorSchemePref === "system" ? system : colorSchemePref;
    return scheme === "dark" ? darkColors : lightColors;
}

// Theme constants
const theme = {
    space2: 2,
    space4: 4,
    space8: 8,
    space12: 12,
    space16: 16,
    space24: 24,
    space32: 32,
    fontSize12: 12,
    fontSize14: 14,
    fontSize16: 16,
    fontSize18: 18,
    fontSize20: 20,
    fontSize24: 24,
    fontSize32: 32,
    borderRadius10: 10,
    borderRadius20: 20,
    borderRadius32: 32,
    color: {
        background: "#FFFFFF",
        backgroundSecondary: "#F7F9FC",
        textPrimary: "#111827",
        textSecondary: "#6B7280",
        border: "#E5E7EB",
        success: "#10B981",
        error: "#EF4444",
        warning: "#F59E0B",
        primary: "#0069b4",
    },
};

function get_standard(vds_standard?: string): string {
    switch (vds_standard) {
        case "DOC_ISO22376_2023":
            return "ISO 22376:2023";
        case "DOC_105":
            return "AFNOR XP Z42 105";
        case "DOC_101":
            return "AFNOR XP Z42 101 - 104";
        default:
            return vds_standard ?? "";
    }
}

function labelForKey(key: string, lang?: string) {
    const guess = getLabel(key, lang);
    if (guess && guess !== key) return guess;
    return key.charAt(0).toUpperCase() + key.slice(1).replace("_", " ");
}

function formatDocumentTypeTitle(value: unknown): string | undefined {
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    if (!trimmed) return "";
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function AttributeRow({
    label,
    value,
    index,
}: {
    label: string;
    value: ReactNode;
    index: number;
}) {
    const c = useColors();
    const styles = useMemo(() => getStyles(c), [c]);
    const isEmptyString = typeof value === "string" && value.trim() === "";
    return (
        <View style={styles.attributeRow}>
            <Text style={styles.attributeLabel}>{label}</Text>
            {typeof value === "string" || typeof value === "number" ? (
                <View style={styles.attributeValueContainer}>
                    <Text selectable style={styles.attributeValue}>
                        {value}
                    </Text>
                    {isEmptyString && (
                        <Ionicons
                            name="alert-circle-outline"
                            size={14}
                            color={c.textSecondary}
                            style={{ marginLeft: theme.space8 }}
                        />
                    )}
                </View>
            ) : (
                value
            )}
        </View>
    );
}

function Section({
    title,
    children,
    icon,
}: {
    title: string;
    children: ReactNode;
    icon?: ReactNode;
}) {
    const c = useColors();
    const styles = getStyles(c);
    return (
        <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
                {icon}
                <Text accessibilityRole="header" style={styles.sectionTitle}>
                    {title}
                </Text>
            </View>
            {children}
        </View>
    );
}

function Base64PreviewImage({
    base64,
    lang,
}: {
    base64: string;
    lang?: string;
}) {
    const [naturalSize, setNaturalSize] = useState<{
        width: number;
        height: number;
    } | null>(null);
    const [isPreviewVisible, setIsPreviewVisible] = useState(false);
    const [loadError, setLoadError] = useState(false);
    const insets = useSafeAreaInsets();
    const c = useColors();
    const styles = getStyles(c);

    const source = useMemo(
        () => ({ uri: "data:image/webp;base64," + base64 }),
        [base64],
    );

    const imageStyle = useMemo(() => {
        const MAX_SIZE = 220;
        const FALLBACK_SIZE = 120;

        if (!naturalSize || !naturalSize.width || !naturalSize.height) {
            return {
                width: FALLBACK_SIZE,
                height: FALLBACK_SIZE,
                borderRadius: 8,
            };
        }

        const scale = Math.min(
            1,
            MAX_SIZE / naturalSize.width,
            MAX_SIZE / naturalSize.height,
        );

        return {
            width: Math.round(naturalSize.width * scale),
            height: Math.round(naturalSize.height * scale),
            borderRadius: 8,
        };
    }, [naturalSize]);

    if (loadError) {
        return (
            <View
                style={[
                    styles.attributeValueContainer,
                    { flexDirection: "row", alignItems: "center" },
                ]}
            >
                <Ionicons
                    name="lock-closed-outline"
                    size={14}
                    color={c.textSecondary}
                    style={{ marginRight: theme.space4 }}
                />
                <Text
                    style={[
                        styles.attributeValue,
                        { color: c.textSecondary, fontStyle: "italic" },
                    ]}
                >
                    {getLabel("encrypted_image", lang)}
                </Text>
            </View>
        );
    }

    return (
        <>
            <Pressable
                onPress={() => setIsPreviewVisible(true)}
                accessibilityRole="imagebutton"
                accessibilityLabel={getLabel("open_image_preview", lang)}
            >
                <Image
                    style={imageStyle}
                    source={source}
                    onLoad={(event) => {
                        const { width, height } =
                            event.nativeEvent.source || {};
                        if (
                            typeof width === "number" &&
                            typeof height === "number" &&
                            width > 0 &&
                            height > 0
                        ) {
                            setNaturalSize({ width, height });
                        }
                    }}
                    onError={() => setLoadError(true)}
                />
            </Pressable>

            <Modal
                visible={isPreviewVisible}
                transparent
                animationType="fade"
                supportedOrientations={[
                    "portrait",
                    "portrait-upside-down",
                    "landscape-left",
                    "landscape-right",
                ]}
                onRequestClose={() => setIsPreviewVisible(false)}
            >
                <View
                    accessibilityViewIsModal
                    onAccessibilityEscape={() => setIsPreviewVisible(false)}
                    style={[
                        styles.imageModalOverlay,
                        {
                            paddingTop: insets.top,
                            paddingBottom: insets.bottom,
                            paddingLeft: insets.left,
                            paddingRight: insets.right,
                        },
                    ]}
                >
                    <Pressable
                        style={styles.imageModalBackdrop}
                        accessible={false}
                        importantForAccessibility="no"
                        onPress={() => setIsPreviewVisible(false)}
                        accessibilityRole="button"
                        accessibilityLabel={getLabel(
                            "close_image_preview",
                            lang,
                        )}
                    />
                    <View style={styles.imageModalContent}>
                        <Image
                            source={source}
                            style={styles.imageModalImage}
                            resizeMode="contain"
                        />
                    </View>
                    <Pressable
                        style={[
                            styles.imageModalCloseButton,
                            {
                                top: insets.top + theme.space12,
                                right: insets.right + theme.space16,
                            },
                        ]}
                        onPress={() => setIsPreviewVisible(false)}
                        accessibilityRole="button"
                        accessibilityLabel={getLabel(
                            "close_image_preview",
                            lang,
                        )}
                    >
                        <Ionicons name="close" size={24} color="#FFFFFF" />
                    </Pressable>
                </View>
            </Modal>
        </>
    );
}

// Status badge component
function StatusBadge({
    status,
    lang,
}: {
    status: "valid" | "invalid" | "unsigned" | "nonverifiable";
    lang: string;
}) {
    const c = useColors();
    const styles = getStyles(c);
    const statusConfig = {
        valid: {
            icon: "checkmark-circle",
            color: c.success,
            text: getLabel("valid", lang),
        },
        invalid: {
            icon: "close-circle",
            color: c.error,
            text: getLabel("invalid", lang),
        },
        unsigned: {
            icon: "alert-circle",
            color: c.warning,
            text: getLabel("unsigned", lang),
        },
        nonverifiable: {
            icon: "help-circle",
            color: c.warning,
            text: getLabel("nonverifiable", lang),
        },
    };

    const config = statusConfig[status];

    return (
        <View
            accessible
            accessibilityLabel={config.text}
            style={styles.statusBadge}
        >
            <Ionicons
                name={config.icon as any}
                size={20}
                color={config.color}
            />
            <Text style={[styles.statusText, { color: config.color }]}>
                {config.text}
            </Text>
        </View>
    );
}

export default function ResultScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { result, setResult: setContextResult, setStatus } = useScanStatus();
    const { advancedMode } = useSettings();
    const [lang, setLang] = useState<string>("en");
    const [selectedTab, setSelectedTab] = useState<"data" | "details">("data");
    const [reduceTransparency, setReduceTransparency] = useState(true);
    useEffect(() => {
        let active = true;
        AccessibilityInfo.isReduceTransparencyEnabled()
            .then((enabled) => {
                if (active) setReduceTransparency(enabled);
            })
            .catch(() => {
                // Keep the opaque fallback if the accessibility setting is unavailable.
            });
        const subscription = AccessibilityInfo.addEventListener(
            "reduceTransparencyChanged",
            setReduceTransparency,
        );
        return () => {
            active = false;
            subscription.remove();
        };
    }, []);
    const canUseGlass =
        Platform.OS === "ios" &&
        isLiquidGlassAvailable() &&
        isGlassEffectAPIAvailable() &&
        !reduceTransparency;

    const [shareMenuVisible, setShareMenuVisible] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const headerHeight = useHeaderHeight();
    const pendingShareAction = useRef<(() => Promise<void>) | null>(null);
    const insets = useSafeAreaInsets();

    const c = useColors();
    const { colorSchemePref } = useSettings();
    const system = useColorScheme() ?? "light";
    const scheme = colorSchemePref === "system" ? system : colorSchemePref;
    const styles = getStyles(c);
    // Precompute rows to avoid heavy work each render while also keeping hooks at top-level
    const dataRows = useMemo(() => {
        if (!result) return [] as ReactNode[];
        const keys = Object.keys(result.data).filter((key) => {
            const v = result.data[key];
            if (advancedMode) {
                // In advanced mode, include all keys, even empty/placeholder
                return true;
            }
            if (v === null || v === undefined) return false;
            if (typeof v === "string" && v.trim() === "") return false;
            if (
                Array.isArray(v) &&
                v.length === 1 &&
                (v[0] === "" || v[0] === null || v[0] === undefined)
            ) {
                return false;
            }
            return true;
        });
        return keys.map((key, i) => {
            const v = result.data[key];
            if (
                typeof v === "string" &&
                (key.toLowerCase().includes("image") ||
                    key.toLowerCase().includes("photo")) &&
                isBase64(v)
            ) {
                return (
                    <AttributeRow
                        key={key}
                        label={labelForKey(key, lang)}
                        value={<Base64PreviewImage base64={v} lang={lang} />}
                        index={i}
                    />
                );
            }
            if (
                typeof v === "string" ||
                typeof v === "number" ||
                (Array.isArray(v) &&
                    v.every(
                        (e) => typeof e === "string" || typeof e === "number",
                    ))
            ) {
                return (
                    <AttributeRow
                        key={key}
                        label={labelForKey(key, lang)}
                        value={formatData(v, lang) as any}
                        index={i}
                    />
                );
            }
            if (v && typeof v === "object" && !Array.isArray(v)) {
                const entries = Object.entries(v).filter(([, value]) => {
                    if (advancedMode) return true;
                    if (value === null || value === undefined) return false;
                    if (typeof value === "string" && value.trim() === "")
                        return false;
                    if (
                        Array.isArray(value) &&
                        value.length === 1 &&
                        (value[0] === "" ||
                            value[0] === null ||
                            value[0] === undefined)
                    ) {
                        return false;
                    }
                    return true;
                });

                if (entries.length === 0) return null;

                return (
                    <AttributeRow
                        key={key}
                        label={labelForKey(key, lang)}
                        value={
                            <View style={styles.nestedObjectContainer}>
                                {entries.map(([subKey, subValue]) => {
                                    const isSimpleValue =
                                        typeof subValue === "string" ||
                                        typeof subValue === "number" ||
                                        typeof subValue === "boolean" ||
                                        (Array.isArray(subValue) &&
                                            subValue.every(
                                                (e) =>
                                                    typeof e === "string" ||
                                                    typeof e === "number",
                                            ));

                                    const displayValue = isSimpleValue
                                        ? formatData(subValue, lang)
                                        : JSON.stringify(subValue);

                                    return (
                                        <View
                                            key={`${key}-${subKey}`}
                                            style={styles.nestedRow}
                                        >
                                            <View style={styles.nestedLine}>
                                                <Text
                                                    style={
                                                        styles.attributeLabel
                                                    }
                                                >
                                                    {labelForKey(subKey, lang)}
                                                </Text>
                                            </View>
                                            <View style={styles.nestedLine}>
                                                {typeof displayValue ===
                                                    "string" ||
                                                typeof displayValue ===
                                                    "number" ? (
                                                    <Text
                                                        selectable
                                                        style={
                                                            styles.attributeValue
                                                        }
                                                    >
                                                        {displayValue}
                                                    </Text>
                                                ) : (
                                                    displayValue
                                                )}
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        }
                        index={i}
                    />
                );
            }
            return null;
        });
    }, [result, lang, advancedMode, styles]);

    const headerRows = useMemo(() => {
        if (!result) return [] as ReactNode[];
        const keys = Object.keys(result.header).filter((k) => {
            const v = result.header[k];
            if (advancedMode) {
                return true;
            }
            if (v === null || v === undefined) return false;
            if (typeof v === "string" && v.trim() === "") return false;
            if (
                Array.isArray(v) &&
                v.length === 1 &&
                (v[0] === "" || v[0] === null || v[0] === undefined)
            ) {
                return false;
            }
            return true;
        });
        return keys.map((k, i) => {
            const headerValue = result.header[k];

            // For "Type de document", reuse the same localized, title-cased
            // string used in the hero section instead of showing the raw object.
            if (k === "Type de document") {
                const localizedType = getLocalizedDocumentType(
                    headerValue,
                    lang,
                );
                const displayType = formatDocumentTypeTitle(localizedType);

                return (
                    <AttributeRow
                        key={`header-${k}`}
                        label={labelForKey(k, lang)}
                        value={displayType ?? ""}
                        index={i}
                    />
                );
            }

            const isObjectValue =
                headerValue !== null &&
                typeof headerValue === "object" &&
                !Array.isArray(headerValue);

            const displayValue = isObjectValue
                ? JSON.stringify(headerValue)
                : (formatData(headerValue, lang) as any);

            return (
                <AttributeRow
                    key={`header-${k}`}
                    label={labelForKey(k, lang)}
                    value={displayValue}
                    index={i}
                />
            );
        });
    }, [result, lang, advancedMode]);

    const signerRows = useMemo(() => {
        if (!result || !result.signer) return [] as ReactNode[];
        const sKeys = Object.keys(result.signer).filter((k) => {
            const v = result.signer?.[k];
            if (advancedMode) {
                return true;
            }
            if (v === null || v === undefined) return false;
            if (typeof v === "string" && v.trim() === "") return false;
            if (
                Array.isArray(v) &&
                v.length === 1 &&
                (v[0] === "" || v[0] === null || v[0] === undefined)
            ) {
                return false;
            }
            return true;
        });
        return sKeys.map((k, i) => (
            <AttributeRow
                key={`signer-${k}`}
                label={labelForKey(k, lang)}
                value={formatData(result.signer?.[k], lang) as any}
                index={i}
            />
        ));
    }, [result, lang, advancedMode]);

    useEffect(() => {
        const getLangAsync = async () => {
            const l = await getLang();
            setLang(l);
        };
        getLangAsync();
    }, []);

    // If no result in context but a route param is present (history navigation), load it
    useEffect(() => {
        if (!result && params.result && typeof params.result === "string") {
            try {
                const parsed = JSON.parse(params.result as string);
                const normalized = normalizeVdsResult(parsed);
                if (!normalized) return;
                setContextResult(normalized);
                if (normalized.sign_is_valid && normalized.signer) {
                    setStatus("valid");
                } else if (normalized.signer) {
                    setStatus("invalid");
                } else {
                    setStatus("nonverifiable");
                }
            } catch {
                // Invalid JSON: ignore and let redirect happen
            }
        }
    }, [params.result, result, setContextResult, setStatus]);

    const openShareMenu = useCallback(() => setShareMenuVisible(true), []);
    const closeShareMenu = useCallback(() => setShareMenuVisible(false), []);
    const runPendingShare = useCallback(() => {
        const action = pendingShareAction.current;
        pendingShareAction.current = null;
        if (action)
            requestAnimationFrame(() => {
                void action();
            });
    }, []);
    const dismissAndRun = useCallback((action: () => Promise<void>) => {
        if (pendingShareAction.current) return;
        pendingShareAction.current = action;
        setShareMenuVisible(false);
    }, []);

    const scrollY = useSharedValue(0);
    const reduceMotion = useReducedMotion();
    const [heroHeight, setHeroHeight] = useState(0);
    const [tabsHeight, setTabsHeight] = useState(0);
    const compactScale = reduceMotion ? 1 : 0.8;
    const collapseDistance = heroHeight * (1 - compactScale);
    // Keep the same compact size, but reach it over a longer scroll gesture.
    const collapseScrollRange = Math.max(160, collapseDistance * 2);
    const onResultScroll = useAnimatedScrollHandler((event) => {
        scrollY.value = Math.max(0, event.contentOffset.y);
    });
    const headerMotion = useAnimatedStyle(() => ({
        transform: [
            {
                translateY:
                    -collapseDistance *
                    Math.min(1, scrollY.value / collapseScrollRange),
            },
        ],
    }));
    const heroMotion = useAnimatedStyle(() => ({
        transform: [
            {
                scale:
                    1 -
                    (1 - compactScale) *
                        Math.min(1, scrollY.value / collapseScrollRange),
            },
        ],
    }));
    const topClearance =
        Platform.OS === "ios"
            ? Math.max(insets.top, headerHeight)
            : insets.top + 68;

    if (!result) return <Redirect href="/" />;

    const securityStatus: "valid" | "invalid" | "unsigned" | "nonverifiable" =
        result.sign_is_valid && result.signer
            ? "valid"
            : result.signer
              ? "invalid"
              : "nonverifiable";
    const localizedType = getLocalizedDocumentType(
        result.header["Type de document"],
        lang,
    );
    const documentType =
        formatDocumentTypeTitle(localizedType) || getLabel("result", lang);

    const close = () => {
        setContextResult(null);
        setStatus(null);
        router.back();
    };

    const getPdfLogoDataUri = async (): Promise<string | null> => {
        try {
            const logoAsset = Asset.fromModule(
                require("../../assets/icons/icon.png"),
            );
            if (!logoAsset.localUri) {
                await logoAsset.downloadAsync();
            }

            const logoUri = logoAsset.localUri ?? logoAsset.uri;
            if (!logoUri) return null;

            const logoBase64 = await FileSystem.readAsStringAsync(logoUri, {
                encoding: FileSystem.EncodingType.Base64,
            });
            return `data:image/png;base64,${logoBase64}`;
        } catch {
            return null;
        }
    };

    const buildShareHtml = async () => {
        const logoDataUri = await getPdfLogoDataUri();
        const makeRows = (entries: [string, unknown][]) =>
            entries
                .filter(([, v]) => v !== null && v !== undefined && v !== "")
                .map(
                    ([k, v]) =>
                        `<tr><td style="padding:6px 10px;color:#6B7280;font-size:13px">${labelForKey(k, lang)}</td>` +
                        `<td style="padding:6px 10px;font-weight:600">${formatData(v, lang) ?? ""}</td></tr>`,
                )
                .join("");

        const dataRows = makeRows(Object.entries(result.data));

        const headerRows = makeRows(
            Object.entries(result.header).map(([k, v]) => {
                if (k === "Type de document") {
                    const loc = getLocalizedDocumentType(v, lang);
                    return [k, loc ?? ""] as [string, unknown];
                }
                return [k, v] as [string, unknown];
            }),
        );

        const signerRows = result.signer
            ? makeRows(Object.entries(result.signer))
            : "";

        const statusColor =
            securityStatus === "valid"
                ? "#10B981"
                : securityStatus === "invalid"
                  ? "#EF4444"
                  : "#F59E0B";
        const poweredBy = "powered by VDS Verify";

        const sectionStyle = `font-size:16px;font-weight:700;margin:24px 0 8px;color:#111827;`;
        const tableStyle = `width:100%;border-collapse:collapse;border-radius:10px;overflow:hidden;background:#F7F9FC;margin-bottom:16px;`;

        return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:32px;color:#111827;}
h1{font-size:22px;margin-bottom:4px;}p{margin:4px 0 20px;color:${statusColor};font-weight:600;font-size:15px;}
    table{${tableStyle}}tr:nth-child(even){background:#EEF2F7;}footer{margin-top:32px;font-size:11px;color:#9CA3AF;}footer .meta{margin-bottom:12px;}footer .powered{display:flex;align-items:center;justify-content:flex-end;gap:8px;font-size:12px;color:#4B5563;font-weight:600;}footer .powered img{width:18px;height:18px;border-radius:4px;object-fit:cover;}</style>
</head><body>
<h1>${documentType}</h1>
<p>${getLabel(securityStatus, lang)}</p>
<h2 style="${sectionStyle}">${getLabel("data", lang)}</h2>
<table>${dataRows}</table>
<h2 style="${sectionStyle}">${getLabel("header", lang)}</h2>
<table>${headerRows}</table>
${signerRows ? `<h2 style="${sectionStyle}">${getLabel("signer", lang)}</h2><table>${signerRows}</table>` : ""}
<h2 style="${sectionStyle}">${getLabel("standard", lang)}</h2>
<table><tr><td style="padding:6px 10px;color:#6B7280;font-size:13px">${getLabel("compliance", lang)}</td><td style="padding:6px 10px;font-weight:600">${get_standard(result.vds_standard)}</td></tr></table>
    <footer>
    <div class="meta">VDS Verify &mdash; ${new Date().toLocaleDateString()}</div>
    <div class="powered">${logoDataUri ? `<img src="${logoDataUri}" alt="VDS Verify logo"/>` : ""}<span>${poweredBy}</span></div>
    </footer>
</body></html>`;
    };

    const getSharePath = (extension: "json" | "pdf") => {
        const now = new Date();
        const date = [
            now.getFullYear(),
            String(now.getMonth() + 1).padStart(2, "0"),
            String(now.getDate()).padStart(2, "0"),
        ].join("");
        const safeType =
            Array.from(
                documentType
                    .normalize("NFC")
                    // Strip control characters from API-provided file names.
                    // eslint-disable-next-line no-control-regex
                    .replace(/[<>:"/\\|?*\u0000-\u001f\u007f]/g, "-")
                    .replace(/\s+/g, " ")
                    .trim(),
            )
                .slice(0, 60)
                .join("")
                .replace(/[. ]+$/, "") || "document";
        return (
            FileSystem.cacheDirectory +
            encodeURIComponent(`${date}-${safeType}.${extension}`)
        );
    };

    const handleShareJson = () => {
        dismissAndRun(async () => {
            setIsSharing(true);
            try {
                const json = JSON.stringify(result, null, 2);
                const path = getSharePath("json");
                await FileSystem.writeAsStringAsync(path, json, {
                    encoding: FileSystem.EncodingType.UTF8,
                });
                if (await Sharing.isAvailableAsync()) {
                    await Sharing.shareAsync(path, {
                        mimeType: "application/json",
                    });
                }
            } catch {
                Alert.alert(
                    getLabel("error", lang),
                    getLabel("share_error", lang),
                );
            } finally {
                setIsSharing(false);
            }
        });
    };

    const handleSharePdf = () => {
        dismissAndRun(async () => {
            setIsSharing(true);
            try {
                const html = await buildShareHtml();
                const { uri } = await Print.printToFileAsync({
                    html,
                    base64: false,
                });
                const pdfPath = getSharePath("pdf");
                await FileSystem.copyAsync({ from: uri, to: pdfPath });
                if (await Sharing.isAvailableAsync()) {
                    await Sharing.shareAsync(pdfPath, {
                        mimeType: "application/pdf",
                    });
                }
            } catch {
                Alert.alert(
                    getLabel("error", lang),
                    getLabel("share_error", lang),
                );
            } finally {
                setIsSharing(false);
            }
        });
    };

    const TabBarSurface = canUseGlass ? GlassView : View;

    return (
        <View style={styles.container}>
            {Platform.OS === "ios" && (
                <>
                    <Stack.Screen
                        options={{
                            headerShown: true,
                            headerTransparent: true,
                            headerTitle: "",
                            headerBackVisible: false,
                            headerTintColor: c.buttonIconColor,
                        }}
                    />
                    <Stack.Toolbar placement="left">
                        <Stack.Toolbar.Button icon="xmark" onPress={close}>
                            {getLabel("close", lang)}
                        </Stack.Toolbar.Button>
                    </Stack.Toolbar>
                    <Stack.Toolbar placement="right">
                        <Stack.Toolbar.Button
                            icon="square.and.arrow.up"
                            onPress={openShareMenu}
                            disabled={isSharing}
                        >
                            {getLabel("share", lang)}
                        </Stack.Toolbar.Button>
                    </Stack.Toolbar>
                </>
            )}
            {Platform.OS !== "ios" && (
                <>
                    <Pressable
                        style={[
                            styles.closeButton,
                            {
                                top: insets.top + 14,
                                left: insets.left + theme.space16,
                            },
                        ]}
                        onPress={close}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel={getLabel("close", lang)}
                    >
                        <View style={styles.closeButtonSolid}>
                            <Ionicons
                                name="close"
                                size={22}
                                color={c.buttonIconColor}
                            />
                        </View>
                    </Pressable>
                    <Pressable
                        style={[
                            styles.shareButton,
                            {
                                top: insets.top + 14,
                                right: insets.right + theme.space16,
                            },
                        ]}
                        onPress={openShareMenu}
                        disabled={isSharing}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel={getLabel("share", lang)}
                    >
                        <View style={styles.closeButtonSolid}>
                            <Ionicons
                                name="share-outline"
                                size={22}
                                color={c.buttonIconColor}
                            />
                        </View>
                    </Pressable>
                </>
            )}

            <View
                style={{ flex: 1, marginTop: topClearance, overflow: "hidden" }}
            >
                <Animated.ScrollView
                    testID="result-scroll"
                    onScroll={onResultScroll}
                    scrollEventThrottle={16}
                    contentInsetAdjustmentBehavior="never"
                    showsVerticalScrollIndicator={false}
                    style={styles.scrollView}
                    contentContainerStyle={{
                        paddingTop: heroHeight + tabsHeight,
                        paddingLeft: insets.left + theme.space16,
                        paddingRight: insets.right + theme.space16,
                        paddingBottom: Math.max(insets.bottom, theme.space24),
                    }}
                >
                    <View style={[styles.readableContent, { maxWidth: 760 }]}>
                        <View>
                            {selectedTab === "data" && (
                                <View testID="result-data-panel">
                                    <Section
                                        title={getLabel("data", lang)}
                                        icon={
                                            <Ionicons
                                                name="document-text-outline"
                                                size={20}
                                                color={c.textPrimary}
                                                style={{
                                                    marginRight: theme.space8,
                                                }}
                                            />
                                        }
                                    >
                                        <View style={styles.sectionContent}>
                                            {dataRows}
                                        </View>
                                    </Section>
                                </View>
                            )}
                            {selectedTab === "details" && (
                                <View testID="result-details-panel">
                                    {/* Header information section */}
                                    <Section
                                        title={getLabel("header", lang)}
                                        icon={
                                            <Ionicons
                                                name="browsers-outline"
                                                size={20}
                                                color={c.textPrimary}
                                                style={{
                                                    marginRight: theme.space8,
                                                }}
                                            />
                                        }
                                    >
                                        <View style={styles.sectionContent}>
                                            {headerRows}
                                        </View>
                                    </Section>

                                    {/* Signature section */}
                                    <Section
                                        title={getLabel("signer", lang)}
                                        icon={
                                            <Ionicons
                                                name={
                                                    securityStatus === "valid"
                                                        ? "shield-checkmark"
                                                        : securityStatus ===
                                                            "invalid"
                                                          ? "shield"
                                                          : "shield-half"
                                                }
                                                size={20}
                                                color={
                                                    securityStatus === "valid"
                                                        ? theme.color.success
                                                        : securityStatus ===
                                                            "invalid"
                                                          ? theme.color.error
                                                          : theme.color.warning
                                                }
                                                style={{
                                                    marginRight: theme.space8,
                                                }}
                                            />
                                        }
                                    >
                                        {result.signer ? (
                                            <View style={styles.sectionContent}>
                                                {signerRows}
                                            </View>
                                        ) : (
                                            <Text style={styles.noSignerText}>
                                                {getLabel(
                                                    "sign_not_verified",
                                                    lang,
                                                )}
                                            </Text>
                                        )}
                                    </Section>

                                    {/* Compliance section */}
                                    <Section
                                        title={getLabel("standard", lang)}
                                        icon={
                                            <Ionicons
                                                name="checkmark-done-circle-outline"
                                                size={20}
                                                color={c.textPrimary}
                                                style={{
                                                    marginRight: theme.space8,
                                                }}
                                            />
                                        }
                                    >
                                        <View style={styles.sectionContent}>
                                            <AttributeRow
                                                label={getLabel(
                                                    "compliance",
                                                    lang,
                                                )}
                                                value={get_standard(
                                                    result.vds_standard,
                                                )}
                                                index={0}
                                            />
                                        </View>
                                    </Section>
                                </View>
                            )}
                        </View>
                    </View>
                </Animated.ScrollView>
                <Animated.View
                    pointerEvents="box-none"
                    style={[
                        {
                            position: "absolute",
                            top: 0,
                            left: insets.left,
                            right: insets.right,
                            backgroundColor: c.background,
                            paddingHorizontal: theme.space16,
                        },
                        headerMotion,
                    ]}
                >
                    <View
                        onLayout={(event) =>
                            setHeroHeight(event.nativeEvent.layout.height)
                        }
                        style={[styles.readableContent, { maxWidth: 760 }]}
                    >
                        <Animated.View
                            style={[
                                {
                                    paddingTop: 8,
                                    paddingBottom: 16,
                                    transformOrigin: "center bottom",
                                },
                                heroMotion,
                            ]}
                        >
                            {result.testdata && (
                                <View style={styles.testdataBanner}>
                                    <Text style={styles.testdataBannerText}>
                                        {getLabel("testdata", lang)}
                                    </Text>
                                </View>
                            )}
                            {/* Hero section - centered document info and status */}
                            <View style={styles.heroSection}>
                                <Text
                                    selectable
                                    accessibilityRole="header"
                                    style={styles.documentTitle}
                                >
                                    {documentType}
                                </Text>
                                <StatusBadge
                                    status={securityStatus}
                                    lang={lang}
                                />
                            </View>
                        </Animated.View>
                    </View>
                    <View
                        onLayout={(event) =>
                            setTabsHeight(event.nativeEvent.layout.height)
                        }
                    >
                        <View style={styles.stickyTabs}>
                            <View
                                style={[
                                    styles.readableContent,
                                    { maxWidth: 760 },
                                ]}
                            >
                                <TabBarSurface
                                    {...(canUseGlass
                                        ? {
                                              glassEffectStyle:
                                                  "regular" as const,
                                              colorScheme: scheme,
                                              isInteractive: true,
                                          }
                                        : {})}
                                    style={[
                                        styles.tabContainer,
                                        !canUseGlass && styles.tabPillFallback,
                                    ]}
                                >
                                    {(["data", "details"] as const).map(
                                        (tab) => {
                                            const selected =
                                                selectedTab === tab;
                                            return (
                                                <Pressable
                                                    key={tab}
                                                    testID={`result-tab-${tab}`}
                                                    accessibilityRole="tab"
                                                    accessibilityLabel={getLabel(
                                                        tab === "data"
                                                            ? "data"
                                                            : "security",
                                                        lang,
                                                    )}
                                                    accessibilityState={{
                                                        selected,
                                                    }}
                                                    onPress={() =>
                                                        setSelectedTab(tab)
                                                    }
                                                    style={[
                                                        styles.tabPill,
                                                        selected &&
                                                            styles.tabPillActive,
                                                    ]}
                                                >
                                                    <Ionicons
                                                        name={
                                                            tab === "data"
                                                                ? "document-text-outline"
                                                                : "information-circle-outline"
                                                        }
                                                        size={24}
                                                        color={
                                                            selected
                                                                ? c.primary
                                                                : c.textSecondary
                                                        }
                                                    />
                                                    <Text
                                                        style={[
                                                            styles.tabLabel,
                                                            selected &&
                                                                styles.tabLabelActive,
                                                        ]}
                                                    >
                                                        {getLabel(
                                                            tab === "data"
                                                                ? "data"
                                                                : "security",
                                                            lang,
                                                        )}
                                                    </Text>
                                                </Pressable>
                                            );
                                        },
                                    )}
                                </TabBarSurface>
                            </View>
                        </View>
                    </View>
                </Animated.View>
            </View>

            <Host colorScheme={scheme} style={{ position: "absolute" }}>
                <BottomSheet
                    testID="share-sheet"
                    isPresented={shareMenuVisible}
                    onDismiss={closeShareMenu}
                    containerColor={c.background}
                    contentPadding={{ top: 32, left: 24, right: 24, bottom: 0 }}
                    modifiers={
                        Platform.OS === "ios"
                            ? [
                                  ignoreSafeArea({
                                      regions: "container",
                                      edges: "horizontal",
                                  }),
                              ]
                            : undefined
                    }
                >
                    <Column
                        spacing={16}
                        style={{ paddingBottom: 24 }}
                        modifiers={
                            Platform.OS === "ios"
                                ? [
                                      frame({
                                          maxWidth: Infinity,
                                          alignment: "leading",
                                      }),
                                  ]
                                : Platform.OS === "android"
                                  ? [fillMaxWidth()]
                                  : undefined
                        }
                        onDisappear={runPendingShare}
                    >
                        <NativeText
                            textStyle={{
                                fontSize: 22,
                                fontWeight: "600",
                                color: c.textPrimary,
                            }}
                        >
                            {getLabel("share", lang)}
                        </NativeText>
                        <Button
                            testID="share-pdf"
                            variant="outlined"
                            disabled={isSharing}
                            onPress={handleSharePdf}
                            label={getLabel("share_as_pdf", lang)}
                        />
                        <NativeText textStyle={{ color: c.textSecondary }}>
                            {getLabel("share_pdf_description", lang)}
                        </NativeText>
                        <Button
                            testID="share-json"
                            variant="outlined"
                            disabled={isSharing}
                            onPress={handleShareJson}
                            label={getLabel("share_as_json", lang)}
                        />
                        <NativeText textStyle={{ color: c.textSecondary }}>
                            {getLabel("share_json_description", lang)}
                        </NativeText>
                        <Column
                            alignment="center"
                            style={{ paddingTop: 8 }}
                            modifiers={
                                Platform.OS === "ios"
                                    ? [
                                          frame({
                                              maxWidth: Infinity,
                                              alignment: "center",
                                          }),
                                      ]
                                    : Platform.OS === "android"
                                      ? [fillMaxWidth()]
                                      : undefined
                            }
                        >
                            <Button
                                testID="share-cancel"
                                variant="outlined"
                                style={{
                                    paddingHorizontal: 16,
                                    paddingVertical: 8,
                                }}
                                onPress={closeShareMenu}
                                label={getLabel("cancel", lang)}
                            />
                        </Column>
                    </Column>
                </BottomSheet>
            </Host>
        </View>
    );
}

const stylesCache = new Map<Colors, ReturnType<typeof makeStyles>>();
function getStyles(c: Colors) {
    if (!stylesCache.has(c)) stylesCache.set(c, makeStyles(c));
    return stylesCache.get(c)!;
}

function makeStyles(c: Colors) {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: c.background,
        },
        closeButton: {
            position: "absolute",
            left: theme.space16,
            zIndex: 10,
        },
        closeButtonInner: {
            width: 40,
            height: 40,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255,255,255,0.3)",
        },
        closeButtonSolid: {
            width: 40,
            height: 40,
            padding: 8,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: theme.borderRadius20,
            backgroundColor: c.backgroundSecondary,
            borderWidth: 1,
            borderColor: c.border,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
        },
        readableContent: {
            width: "100%",
            alignSelf: "center",
        },
        stickyTabs: {
            backgroundColor: c.background,
            paddingBottom: theme.space16,
        },
        scrollView: {
            flex: 1,
        },
        scrollViewContent: {
            paddingHorizontal: theme.space16,
        },
        testdataBanner: {
            paddingVertical: theme.space8,
            paddingHorizontal: theme.space12,
            borderRadius: theme.borderRadius20,
            backgroundColor: "#FEE2E2",
            borderWidth: 1,
            borderColor: "#FCA5A5",
            marginBottom: theme.space16,
            alignSelf: "center",
            alignItems: "center",
        },
        testdataBannerText: {
            fontSize: theme.fontSize12,
            fontWeight: "600",
            color: "#B91C1C",
            textTransform: "uppercase",
            letterSpacing: 1,
        },
        heroSection: {
            alignItems: "center",
            marginBottom: theme.space8,
        },
        documentTitle: {
            fontSize: theme.fontSize20,
            fontWeight: "600",
            color: c.textPrimary,
            textAlign: "center",
            marginBottom: theme.space12,
        },
        tabContainer: {
            flexDirection: "row",
            alignSelf: "center",
            width: "100%",
            maxWidth: 360,
            marginTop: theme.space8,
            padding: 5,
            borderRadius: 40,
            borderCurve: "continuous",
            gap: theme.space4,
        },
        tabPillFallback: {
            backgroundColor: c.backgroundSecondary,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: c.border,
        },
        tabPill: {
            flex: 1,
            borderRadius: 35,
            borderCurve: "continuous",
            paddingVertical: theme.space8,
            minHeight: 60,
            paddingHorizontal: theme.space12,
            gap: theme.space4,
            alignItems: "center",
            justifyContent: "center",
        },
        tabPillActive: {
            backgroundColor: c.border,
        },
        tabLabel: {
            fontSize: theme.fontSize12,
            fontWeight: "600",
            color: c.textSecondary,
            textAlign: "center",
        },
        tabLabelActive: {
            color: c.primary,
        },
        statusBadge: {
            flexDirection: "row",
            alignItems: "center",
            gap: theme.space8,
            paddingHorizontal: theme.space16,
            paddingVertical: theme.space8,
            borderRadius: theme.borderRadius20,
            backgroundColor: c.backgroundSecondary,
        },
        statusText: {
            flexShrink: 1,
            fontSize: theme.fontSize16,
            fontWeight: "600",
        },
        separator: {
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: c.border,
            marginVertical: theme.space24,
            width: "100%",
        },
        sectionContainer: {
            marginBottom: theme.space24,
        },
        sectionHeader: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: theme.space16,
        },
        sectionTitle: {
            flex: 1,
            fontSize: theme.fontSize18,
            fontWeight: "600",
            color: c.textPrimary,
        },
        sectionContent: {
            backgroundColor: c.backgroundSecondary,
            borderRadius: theme.borderRadius20,
            padding: theme.space16,
            gap: theme.space8,
        },
        noSignerText: {
            fontSize: theme.fontSize14,
            color: c.textSecondary,
            fontWeight: "500",
            padding: theme.space16,
            backgroundColor: c.backgroundSecondary,
            borderRadius: theme.borderRadius20,
        },
        attributeRow: {
            gap: theme.space4,
        },
        attributeLabel: {
            color: c.textSecondary,
            fontSize: theme.fontSize14,
            fontWeight: "500",
        },
        attributeValueContainer: {
            flexDirection: "row",
            alignItems: "center",
        },
        attributeValue: {
            flexShrink: 1,
            color: c.textPrimary,
            fontSize: theme.fontSize16,
            fontWeight: "600",
        },
        nestedObjectContainer: {
            paddingLeft: theme.space12,
            gap: theme.space8,
        },
        nestedRow: {
            gap: theme.space4,
        },
        nestedLine: {
            flexDirection: "row",
            alignItems: "flex-start",
        },
        nestedBullet: {
            color: c.textSecondary,
            fontSize: theme.fontSize12,
            marginRight: theme.space8,
            marginTop: 2,
        },
        imageModalOverlay: {
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.9)",
            justifyContent: "center",
            alignItems: "center",
        },
        imageModalBackdrop: {
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
        },
        imageModalContent: {
            width: "94%",
            height: "90%",
            justifyContent: "center",
            alignItems: "center",
        },
        imageModalImage: {
            width: "100%",
            height: "100%",
        },
        imageModalCloseButton: {
            position: "absolute",
            top: theme.space32,
            right: theme.space16,
            width: 48,
            height: 48,
            borderRadius: 24,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255,255,255,0.18)",
        },
        shareButton: {
            position: "absolute",
            right: theme.space16,
            zIndex: 10,
        },
    });
}
