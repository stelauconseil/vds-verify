import { ReactNode, useEffect, useMemo, useState } from "react";
import {
  View,
  ScrollView,
  Text,
  Pressable,
  Image,
  Platform,
  StyleSheet,
} from "react-native";
import { Redirect, useRouter, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useScanStatus } from "@/contexts/ScanStatusContext";
import { useSettings } from "@/contexts/SettingsContext";
import { getLang, formatData, isBase64, getLabel } from "@/components/Label";
import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";

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

const ROW_BG_1 = theme.color.backgroundSecondary;
const ROW_BG_2 = "#EEF2F7";

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
  return key.charAt(0).toUpperCase() + key.slice(1);
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
  const bg = index % 2 === 0 ? ROW_BG_1 : ROW_BG_2;
  const isEmptyString = typeof value === "string" && value.trim() === "";
  return (
    <View style={styles.attributeRow}>
      <Text style={styles.attributeLabel}>{label}</Text>
      {typeof value === "string" || typeof value === "number" ? (
        <View style={styles.attributeValueContainer}>
          <Text style={styles.attributeValue}>{value}</Text>
          {isEmptyString && (
            <Ionicons
              name="alert-circle-outline"
              size={14}
              color={theme.color.textSecondary}
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

// Section component similar to React Conf speaker page
function Section({
  title,
  children,
  icon,
}: {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        {icon}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
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
  const statusConfig = {
    valid: {
      icon: "checkmark-circle",
      color: theme.color.success,
      text: getLabel("valid", lang),
    },
    invalid: {
      icon: "close-circle",
      color: theme.color.error,
      text: getLabel("invalid", lang),
    },
    unsigned: {
      icon: "alert-circle",
      color: theme.color.warning,
      text: getLabel("unsigned", lang),
    },
    nonverifiable: {
      icon: "help-circle",
      color: theme.color.warning,
      text: getLabel("nonverifiable", lang),
    },
  };

  const config = statusConfig[status];

  return (
    <View style={styles.statusBadge}>
      <Ionicons name={config.icon as any} size={20} color={config.color} />
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
  const insets = useSafeAreaInsets();
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
      if (typeof v === "string" && key.includes("Image") && isBase64(v)) {
        return (
          <AttributeRow
            key={key}
            label={labelForKey(key, lang)}
            value={
              <Image
                style={{ width: 120, height: 120, borderRadius: 8 }}
                source={{ uri: "data:image/webp;base64," + v }}
              />
            }
            index={i}
          />
        );
      }
      if (
        typeof v === "string" ||
        typeof v === "number" ||
        (Array.isArray(v) &&
          v.every((e) => typeof e === "string" || typeof e === "number"))
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
      return null;
    });
  }, [result, lang, advancedMode]);

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
    return keys.map((k, i) => (
      <AttributeRow
        key={`header-${k}`}
        label={labelForKey(k, lang)}
        value={formatData(result.header[k], lang) as any}
        index={i}
      />
    ));
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
        setContextResult(parsed);
        if (parsed.sign_is_valid && parsed.signer) {
          setStatus("valid");
        } else if (parsed.signer) {
          setStatus("invalid");
        } else {
          setStatus("nonverifiable");
        }
      } catch {
        // Invalid JSON: ignore and let redirect happen
      }
    }
  }, [params.result, result, setContextResult, setStatus]);

  if (!result) return <Redirect href="/" />;

  const securityStatus: "valid" | "invalid" | "unsigned" | "nonverifiable" =
    result.sign_is_valid && result.signer
      ? "valid"
      : result.signer
        ? "invalid"
        : "nonverifiable";

  const rawType = result.header["Type de document"] as string | undefined;

  const documentType =
    (rawType
      ? rawType
          .split(" ")
          .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
          .join(" ")
      : undefined) || getLabel("result", lang);

  const close = () => {
    setContextResult(null);
    setStatus(null);
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Floating close button */}
      <Pressable
        onPress={close}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={getLabel("close", lang)}
        style={[styles.closeButton, { top: insets.top + 14 }]}
      >
        {Platform.OS === "ios" && isLiquidGlassAvailable() ? (
          <BlurView intensity={70} tint="light" style={styles.closeButtonBlur}>
            <View style={styles.closeButtonInner}>
              <Ionicons name="close" size={22} color="#222" />
            </View>
          </BlurView>
        ) : (
          <View style={styles.closeButtonSolid}>
            <Ionicons name="close" size={22} color="#222" />
          </View>
        )}
      </Pressable>

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollViewContent,
          {
            paddingBottom: Platform.select({
              android: 100 + insets.bottom,
              default: theme.space24,
            }),
          },
        ]}
      >
        {/* Hero section - centered document info and status */}
        <View style={styles.heroSection}>
          <View style={styles.documentIconContainer}>
            <Ionicons
              name="document-text"
              size={48}
              color={theme.color.primary}
            />
          </View>
          <Text style={styles.documentTitle}>{documentType}</Text>
          <StatusBadge status={securityStatus} lang={lang} />

          {/* Segmented tabs like Day 1 / Day 2 in React Conf */}
          {Platform.OS === "ios" && isLiquidGlassAvailable() ? (
            <BlurView
              intensity={50}
              tint="light"
              style={styles.tabGlassWrapper}
            >
              <View style={styles.tabContainer}>
                <Pressable
                  onPress={() => setSelectedTab("data")}
                  style={[
                    styles.tabPill,
                    selectedTab === "data" && styles.tabPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.tabLabel,
                      selectedTab === "data" && styles.tabLabelActive,
                    ]}
                  >
                    {getLabel("data", lang)}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setSelectedTab("details")}
                  style={[
                    styles.tabPill,
                    selectedTab === "details" && styles.tabPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.tabLabel,
                      selectedTab === "details" && styles.tabLabelActive,
                    ]}
                  >
                    {getLabel("security", lang)}
                  </Text>
                </Pressable>
              </View>
            </BlurView>
          ) : (
            <View style={styles.tabContainerFallback}>
              <Pressable
                onPress={() => setSelectedTab("data")}
                style={[
                  styles.tabPill,
                  selectedTab === "data" && styles.tabPillActive,
                ]}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    selectedTab === "data" && styles.tabLabelActive,
                  ]}
                >
                  {getLabel("data", lang)}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setSelectedTab("details")}
                style={[
                  styles.tabPill,
                  selectedTab === "details" && styles.tabPillActive,
                ]}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    selectedTab === "details" && styles.tabLabelActive,
                  ]}
                >
                  {getLabel("details", lang)}
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        {selectedTab === "data" ? (
          <Section
            title={getLabel("data", lang)}
            icon={
              <Ionicons
                name="document-text-outline"
                size={20}
                color={theme.color.textPrimary}
                style={{ marginRight: theme.space8 }}
              />
            }
          >
            <View style={styles.sectionContent}>{dataRows}</View>
          </Section>
        ) : (
          <>
            {/* Header information section */}
            <Section
              title={getLabel("header", lang)}
              icon={
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color={theme.color.textPrimary}
                  style={{ marginRight: theme.space8 }}
                />
              }
            >
              <View style={styles.sectionContent}>{headerRows}</View>
            </Section>

            {/* Signature section */}
            <Section
              title={getLabel("signer", lang)}
              icon={
                <Ionicons
                  name={
                    securityStatus === "valid"
                      ? "shield-checkmark"
                      : securityStatus === "invalid"
                        ? "shield"
                        : "shield-half"
                  }
                  size={20}
                  color={
                    securityStatus === "valid"
                      ? theme.color.success
                      : securityStatus === "invalid"
                        ? theme.color.error
                        : theme.color.warning
                  }
                  style={{ marginRight: theme.space8 }}
                />
              }
            >
              {result.signer ? (
                <View style={styles.sectionContent}>{signerRows}</View>
              ) : (
                <Text style={styles.noSignerText}>
                  {getLabel("sign_not_verified", lang)}
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
                  color={theme.color.textPrimary}
                  style={{ marginRight: theme.space8 }}
                />
              }
            >
              <View style={styles.sectionContent}>
                <AttributeRow
                  label={getLabel("compliance", lang)}
                  value={get_standard(result.vds_standard)}
                  index={0}
                />
              </View>
            </Section>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.color.background,
  },
  closeButton: {
    position: "absolute",
    left: theme.space16,
    zIndex: 10,
  },
  closeButtonBlur: {
    borderRadius: theme.borderRadius20,
    overflow: "hidden",
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
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.borderRadius20,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 1,
    borderColor: theme.color.border,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: theme.space16,
    paddingTop: theme.space24,
  },
  heroSection: {
    alignItems: "center",
    marginBottom: theme.space32,
  },
  documentIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.color.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.space16,
    borderWidth: 1,
    borderColor: theme.color.border,
  },
  documentTitle: {
    fontSize: theme.fontSize24,
    fontWeight: "600",
    color: theme.color.textPrimary,
    textAlign: "center",
    marginBottom: theme.space12,
  },
  tabGlassWrapper: {
    borderRadius: theme.borderRadius20,
    overflow: "hidden",
    marginTop: theme.space16,
    alignSelf: "stretch",
    marginHorizontal: theme.space16,
  },
  tabContainer: {
    flexDirection: "row",
    borderRadius: theme.borderRadius20,
    paddingHorizontal: theme.space4,
    paddingVertical: theme.space4,
    gap: theme.space4,
    backgroundColor: "rgba(255,255,255,0.3)",
    //backgroundColor: "rgba(15, 23, 42, 0.3)", // darker glass
  },
  tabContainerFallback: {
    flexDirection: "row",
    borderRadius: theme.borderRadius20,
    paddingHorizontal: theme.space4,
    paddingVertical: theme.space4,
    gap: theme.space4,
    marginTop: theme.space16,
    backgroundColor: theme.color.backgroundSecondary,
  },
  tabPill: {
    flex: 1,
    borderRadius: theme.borderRadius20,
    paddingVertical: theme.space8,
    minHeight: 36,
    paddingHorizontal: theme.space12,
    alignItems: "center",
    justifyContent: "center",
  },
  tabPillActive: {
    backgroundColor: theme.color.primary,
    // extra elevation to mimic glass highlight
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  tabLabel: {
    fontSize: theme.fontSize14,
    fontWeight: "600",
    color: theme.color.textSecondary,
  },
  tabLabelActive: {
    color: "#FFFFFF",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space8,
    paddingHorizontal: theme.space16,
    paddingVertical: theme.space8,
    borderRadius: theme.borderRadius20,
    backgroundColor: theme.color.backgroundSecondary,
  },
  statusText: {
    fontSize: theme.fontSize16,
    fontWeight: "600",
  },
  separator: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.color.border,
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
    fontSize: theme.fontSize18,
    fontWeight: "600",
    color: theme.color.textPrimary,
  },
  sectionContent: {
    backgroundColor: theme.color.backgroundSecondary,
    borderRadius: theme.borderRadius20,
    padding: theme.space16,
    gap: theme.space8,
  },
  noSignerText: {
    fontSize: theme.fontSize14,
    color: theme.color.textSecondary,
    fontWeight: "500",
    padding: theme.space16,
    backgroundColor: theme.color.backgroundSecondary,
    borderRadius: theme.borderRadius20,
  },
  attributeRow: {
    gap: theme.space4,
  },
  attributeLabel: {
    color: theme.color.textSecondary,
    fontSize: theme.fontSize12,
    fontWeight: "500",
  },
  attributeValueContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  attributeValue: {
    color: theme.color.textPrimary,
    fontSize: theme.fontSize16,
    fontWeight: "600",
  },
});
