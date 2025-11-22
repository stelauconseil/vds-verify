import { ReactNode, useEffect, useMemo, useState } from "react";
import {
  View,
  ScrollView,
  Text,
  Pressable,
  Image,
  Platform,
} from "react-native";
import { Redirect, useRouter, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useScanStatus } from "@/contexts/ScanStatusContext";
import { useSettings } from "@/contexts/SettingsContext";
import { getLang, formatData, isBase64, getLabel } from "@/components/Label";
import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";

const ROW_BG_1 = "#F7F9FC"; // very light blue-gray
const ROW_BG_2 = "#EEF2F7"; // slightly darker

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
    <View
      style={{
        backgroundColor: bg,
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginBottom: 8,
      }}
    >
      <Text style={{ color: "#6B7280", fontSize: 12, marginBottom: 4 }}>
        {label}
      </Text>
      {typeof value === "string" || typeof value === "number" ? (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ color: "#111827", fontSize: 16, fontWeight: "600" }}>
            {value}
          </Text>
          {isEmptyString && (
            <Ionicons
              name="alert-circle-outline"
              size={14}
              color="#9CA3AF"
              style={{ marginLeft: 6 }}
            />
          )}
        </View>
      ) : (
        value
      )}
    </View>
  );
}

export default function ResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { result, setResult: setContextResult, setStatus } = useScanStatus();
  const { advancedMode } = useSettings();
  const [lang, setLang] = useState<string>("en");
  const [tab, setTab] = useState<"vds" | "security">("vds");
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
          setStatus("unsigned");
        }
      } catch {
        // Invalid JSON: ignore and let redirect happen
      }
    }
  }, [params.result, result, setContextResult, setStatus]);

  if (!result) return <Redirect href="/" />;

  const securityStatus: "valid" | "invalid" | "unsigned" =
    result.sign_is_valid && result.signer
      ? "valid"
      : result.signer
        ? "invalid"
        : "unsigned";

  const close = () => {
    // Clear result context first so Scan screen restores camera state
    setContextResult(null);
    setStatus(null);
    // Use back() to pop the stack so the transition animates left-to-right
    // (reverse of the push animation) instead of replacing with a forward animation.
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white", paddingTop: insets.top }}>
      {/* Floating liquid glass close button */}
      <Pressable
        onPress={close}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={getLabel("close", lang)}
        style={{
          position: "absolute",
          top: insets.top + 14,
          left: 20,
          zIndex: 10,
        }}
      >
        {Platform.OS === "ios" && isLiquidGlassAvailable() ? (
          <BlurView
            intensity={70}
            tint="light"
            style={{ borderRadius: 20, overflow: "hidden" }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(255,255,255,0.3)",
              }}
            >
              <Ionicons name="close" size={22} color="#222" />
            </View>
          </BlurView>
        ) : (
          <View
            style={{
              width: 40,
              height: 40,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 20,
              backgroundColor: "rgba(255,255,255,0.85)",
              borderWidth: 1,
              borderColor: "#e5e7eb",
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Ionicons name="close" size={22} color="#222" />
          </View>
        )}
      </Pressable>

      {/* Segmented tabs header */}
      <View
        style={{
          alignItems: "center",
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderBottomColor: "#eee",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            backgroundColor: "#EEF2F7",
            padding: 3,
            borderRadius: 18,
            gap: 4,
          }}
        >
          <Pressable
            onPress={() => setTab("vds")}
            style={{ borderRadius: 18, overflow: "hidden" }}
          >
            <View
              style={{
                paddingVertical: 8,
                paddingHorizontal: 18,
                borderRadius: 18,
                backgroundColor: tab === "vds" ? "#0069b4" : "transparent",
              }}
            >
              <Text
                style={{
                  fontWeight: "700",
                  color: tab === "vds" ? "#fff" : "#374151",
                }}
              >
                {getLabel("data", lang)}
              </Text>
            </View>
          </Pressable>
          <Pressable
            onPress={() => setTab("security")}
            style={{ borderRadius: 18, overflow: "hidden" }}
          >
            <View
              style={{
                paddingVertical: 8,
                paddingHorizontal: 18,
                borderRadius: 18,
                backgroundColor: tab === "security" ? "#0069b4" : "transparent",
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
              >
                <Ionicons
                  name={
                    securityStatus === "valid"
                      ? "shield-checkmark-outline"
                      : securityStatus === "invalid"
                        ? "shield-outline"
                        : "shield-half-outline"
                  }
                  size={16}
                  color={tab === "security" ? "#fff" : "#4B5563"}
                />
                <Text
                  style={{
                    fontWeight: "700",
                    color: tab === "security" ? "#fff" : "#374151",
                  }}
                >
                  {getLabel("security", lang)}
                </Text>
              </View>
            </View>
          </Pressable>
        </View>
      </View>

      {tab === "vds" ? (
        <ScrollView
          style={{ paddingHorizontal: "5%" }}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          <Text style={{ color: "#111827", marginBottom: 10, fontSize: 24 }}>
            {(result.header["Type de document"] as string) ||
              getLabel("result", lang)}
          </Text>
          {dataRows}
        </ScrollView>
      ) : (
        <ScrollView
          style={{ paddingHorizontal: "5%" }}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          {/* Header section card */}
          <View
            style={{
              marginTop: 14,
              marginBottom: 12,
              borderRadius: 16,
              backgroundColor: "#F9FAFB",
              padding: 12,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                fontVariant: ["small-caps"],
                color: "#111827",
                marginBottom: 8,
              }}
            >
              {getLabel("header", lang)}
            </Text>
            {headerRows}
          </View>

          {/* Signature section card */}
          <View
            style={{
              marginBottom: 12,
              borderRadius: 16,
              backgroundColor: "#F9FAFB",
              padding: 12,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons
                name={
                  result.sign_is_valid && result.signer
                    ? "checkmark-circle-outline"
                    : "alert-circle-outline"
                }
                size={20}
                color={
                  result.sign_is_valid && result.signer
                    ? "green"
                    : result.signer
                      ? "red"
                      : "orange"
                }
              />
              <Text
                style={{
                  marginLeft: 6,
                  fontSize: 18,
                  fontWeight: "600",
                  fontVariant: ["small-caps"],
                  color: "#111827",
                }}
              >
                {getLabel("signer", lang)}
              </Text>
            </View>
            {result.signer ? (
              <View style={{ marginTop: 10 }}>{signerRows}</View>
            ) : (
              <Text style={{ marginTop: 8 }}>
                {getLabel("sign_not_verified", lang)}
              </Text>
            )}
          </View>

          {/* Standard/compliance section card */}
          <View
            style={{
              marginBottom: 12,
              borderRadius: 16,
              backgroundColor: "#F9FAFB",
              padding: 12,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                fontVariant: ["small-caps"],
                color: "#111827",
                marginBottom: 8,
              }}
            >
              {getLabel("standard", lang)}
            </Text>
            <AttributeRow
              label={getLabel("compliance", lang)}
              value={get_standard(result.vds_standard)}
              index={0}
            />
          </View>
        </ScrollView>
      )}
    </View>
  );
}
