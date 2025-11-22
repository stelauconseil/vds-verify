import { useEffect, useState } from "react";
import { View, ScrollView, Text } from "react-native";
import { Redirect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useScanStatus } from "@/contexts/ScanStatusContext";
import { getLang, formatData, isBase64 } from "@/components/Label";
import { Image } from "react-native";

const formatResult = (
  data: Record<string, any>,
  key: string,
  lang?: string
) => {
  if (key.includes("Image") && isBase64(data[key])) {
    return (
      <View key={key}>
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
      <View key={key}>
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

export default function VdsRoute() {
  const { result, status } = useScanStatus();
  const [lang, setLang] = useState<string>("en");
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const getLangAsync = async () => {
      const l = await getLang();
      setLang(l);
    };
    getLangAsync();
  }, []);

  // If no result exists, redirect back to scan declaratively (avoids early navigation warnings)
  if (!result) return <Redirect href="/" />;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "white",
        paddingTop: insets.top || 16,
      }}
    >
      <ScrollView
        style={{ paddingHorizontal: "5%", paddingTop: 0, paddingBottom: 10 }}
        contentContainerStyle={{ paddingBottom: 20 }}
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
    </View>
  );
}
