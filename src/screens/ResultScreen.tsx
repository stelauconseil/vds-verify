import React, { type ReactNode } from "react";
import { View, ScrollView, Modal, Image, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { formatData, isBase64 } from "../components/Label";
import SecurityDetails from "./SecurityDetails";
import type { VdsResult } from "../types/vds";

const formatResult = (
  data: Record<string, any>,
  key: string,
  lang?: string
): ReactNode => {
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
        <Text
          style={{
            color: "#0069b4",
            fontWeight: "bold",
            marginBottom: 10,
            fontSize: 16,
          }}
        >
          {formatData(data[key], lang)}
        </Text>
      </View>
    );
  } else if (data[key] != null && typeof data[key] === "object") {
    return (
      <View key={key}>
        {isNaN(key as any) && (
          <Text style={{ color: "gray", fontSize: 14 }}>
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </Text>
        )}
        <View style={{ marginLeft: 10 }}>
          {Object.keys(data[key]).map((k) => formatResult(data[key], k, lang))}
        </View>
      </View>
    );
  } else {
    return null;
  }
};

type ResultScreenProps = {
  result: VdsResult;
  lang: string;
  setResult: (v: VdsResult | null) => void;
  setScanned: (v: boolean) => void;
  modalVisible: boolean;
  setModalVisible: (v: boolean) => void;
  navigation: any;
};

const ResultScreen: React.FC<ResultScreenProps> = ({
  result,
  lang,
  setResult,
  setScanned,
  modalVisible,
  setModalVisible,
  navigation,
}) => {
  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);

  const insets = useSafeAreaInsets();

  const statusColorBg =
    result.sign_is_valid && result.signer
      ? "#d3fdc5"
      : result.signer
        ? "#ff95a1"
        : "#ffcc99";
  const statusColorText =
    result.sign_is_valid && result.signer
      ? "green"
      : result.signer
        ? "red"
        : "orange";

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "white",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
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
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <SecurityDetails result={result} lang={lang} closeModal={closeModal} />
      </Modal>
    </View>
  );
};

export default ResultScreen;
