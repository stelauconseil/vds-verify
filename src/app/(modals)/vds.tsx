import { View, ScrollView, Text, Pressable } from "react-native";
import { Redirect, useRouter } from "expo-router";
import { useScanStatus } from "../../contexts/ScanStatusContext";
import { useEffect, useState, Fragment } from "react";
import {
  getLang,
  formatData,
  isBase64,
  getLabel,
} from "../../components/Label";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Divider } from "@rneui/themed";

const get_standard = (vds_standard?: string): string => {
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
};

const formatResult = (
  data: Record<string, any>,
  key: string,
  lang?: string
) => {
  if (key.includes("Image") && isBase64(data[key])) {
    return (
      <View key={key} style={{ marginBottom: 12 }}>
        <Text style={{ color: "gray", fontSize: 14 }}>
          {key.charAt(0).toUpperCase() + key.slice(1)}
        </Text>
        <Image
          style={{ width: 100, height: 100 }}
          source={{ uri: "data:image/webp;base64," + data[key] }}
        />
      </View>
    );
  } else if (
    (typeof data[key] === "string" && data[key] !== "") ||
    typeof data[key] === "number" ||
    (Array.isArray(data[key]) &&
      data[key].every(
        (e: unknown) => typeof e === "string" || typeof e === "number"
      ))
  ) {
    return (
      <View key={key} style={{ marginBottom: 12 }}>
        <Text style={{ color: "gray", fontSize: 14 }}>
          {key.charAt(0).toUpperCase() + key.slice(1)}
        </Text>
        <Text style={{ fontSize: 18 }}>{formatData(data[key], lang)}</Text>
      </View>
    );
  } else {
    return null;
  }
};

export default function VdsModal() {
  const router = useRouter();
  const { result, setResult: setContextResult, setStatus } = useScanStatus();
  const [lang, setLang] = useState<string>("en");
  const [tab, setTab] = useState<"vds" | "security">("vds");
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const getLangAsync = async () => {
      const l = await getLang();
      setLang(l);
    };
    getLangAsync();
  }, []);

  if (!result) return <Redirect href="/" />;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "flex-end",
      }}
    >
      {/* Backdrop to close */}
      <Pressable
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        onPress={() => {
          setContextResult(null);
          setStatus(null);
          router.back();
        }}
        accessibilityRole="button"
        accessibilityLabel="Close VDS"
      />

      {/* Bottom sheet */}
      <View
        style={{
          backgroundColor: "white",
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          maxHeight: "85%",
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 16),
        }}
      >
        {/* Header with handle + close + tabs */}
        <View style={{ paddingHorizontal: 12 }}>
          {/* Drag handle */}
          <View
            style={{
              alignSelf: "center",
              width: 40,
              height: 4,
              borderRadius: 2,
              backgroundColor: "#C8C8C8",
              marginBottom: 8,
            }}
          />

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <Pressable
              onPress={() => {
                setContextResult(null);
                setStatus(null);
                router.back();
              }}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Close"
              style={{ padding: 4 }}
            >
              <Ionicons name="close" size={22} color="#444" />
            </Pressable>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 16,
              }}
            >
              <Pressable onPress={() => setTab("vds")} style={{ padding: 6 }}>
                <Text
                  style={{
                    fontWeight: tab === "vds" ? "700" : "500",
                    color: tab === "vds" ? "#0069b4" : "#666",
                  }}
                >
                  VDS
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setTab("security")}
                style={{ padding: 6 }}
              >
                <Text
                  style={{
                    fontWeight: tab === "security" ? "700" : "500",
                    color: tab === "security" ? "#0069b4" : "#666",
                  }}
                >
                  Security
                </Text>
              </Pressable>
            </View>

            {/* Spacer to balance close icon width */}
            <View style={{ width: 22 }} />
          </View>
        </View>

        {tab === "vds" ? (
          <ScrollView
            style={{ paddingHorizontal: "5%" }}
            contentContainerStyle={{ paddingBottom: 24 }}
          >
            <Text style={{ color: "#0069b4", marginBottom: 10, fontSize: 24 }}>
              {result.header["Type de document"] as string}
            </Text>
            {Object.keys(result.data)
              .filter((key) => {
                return (
                  result.data[key] !== null &&
                  result.data[key] !== undefined &&
                  result.data[key] !== ""
                );
              })
              .map((key) => formatResult(result.data, key, lang))}
          </ScrollView>
        ) : (
          <ScrollView
            style={{ paddingHorizontal: "5%" }}
            contentContainerStyle={{ paddingBottom: 24 }}
          >
            {/* Security details inline */}
            <View style={{ marginBottom: 10 }}>
              <Text style={{ fontSize: 20, color: "black" }}>
                {getLabel("header", lang)}
              </Text>
            </View>
            {Object.keys(result.header).map(
              (key) =>
                result.header[key] !== null && (
                  <Fragment key={key}>
                    <Text style={{ marginBottom: 5 }}>
                      {key}:{" "}
                      <Text
                        style={{
                          color: "#0069b4",
                          fontWeight: "bold",
                          fontSize: 14,
                          lineHeight: 30,
                        }}
                      >
                        {formatData(result.header[key], lang)}
                      </Text>
                    </Text>
                  </Fragment>
                )
            )}
            <Divider style={{ marginVertical: 10 }} />

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
              <Text style={{ marginLeft: 6, fontSize: 20, color: "black" }}>
                Signer
              </Text>
            </View>
            {result.signer ? (
              Object.keys(result.signer).map((key) => (
                <Fragment key={key}>
                  <Text style={{ marginBottom: 5 }}>
                    {key}:{" "}
                    <Text
                      style={{
                        color: "#0069b4",
                        fontWeight: "bold",
                        fontSize: 14,
                        lineHeight: 30,
                      }}
                    >
                      {formatData(result.signer?.[key], lang)}
                    </Text>
                  </Text>
                </Fragment>
              ))
            ) : (
              <Text style={{ marginTop: 5, marginBottom: 5 }}>
                Signature not verified
              </Text>
            )}

            <Divider style={{ marginVertical: 10 }} />
            <Text style={{ fontSize: 20, color: "black" }}>Standard</Text>
            <Text>
              Compliance:{" "}
              <Text
                style={{
                  color: "#0069b4",
                  fontWeight: "bold",
                  fontSize: 14,
                  lineHeight: 30,
                }}
              >
                {get_standard(result.vds_standard)}
              </Text>
            </Text>
          </ScrollView>
        )}
      </View>
    </View>
  );
}
