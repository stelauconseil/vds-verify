import React, { type ReactNode } from "react";
import { View, ScrollView, Modal, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, Divider, Icon } from "@rneui/themed";
import { Button as NativeUIButton } from "../components/Button";
import { getLabel, formatData, isBase64 } from "../components/Label";
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
        <Text h3 h3Style={{ color: "#0069b4", marginBottom: 10 }}>
          {result.header["Type de document"] as string}
        </Text>
        <Divider style={{ marginVertical: 10 }} />
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
      <NativeUIButton
        onPress={openModal}
        title={
          result.sign_is_valid && result.signer
            ? getLabel("valid", lang)
            : result.signer
              ? getLabel("invalid", lang)
              : getLabel("nonverifiable", lang)
        }
        rightIcon={
          <Icon
            name="chevron-up-circle-outline"
            type="ionicon"
            size={20}
            color={statusColorText}
          />
        }
        buttonStyle={{
          backgroundColor: statusColorBg,
          borderWidth: 3,
          borderRadius: 20,
          borderColor: statusColorBg,
          width: "100%",
          paddingVertical: 14,
          alignItems: "center",
          justifyContent: "center",
        }}
        titleStyle={{
          textAlign: "center",
          color: statusColorText,
          fontSize: 16,
        }}
        containerStyle={{ padding: 0 }}
      />
      <NativeUIButton
        title={getLabel("scanagain", lang)}
        onPress={() => {
          setResult(null);
          setScanned(false);
          navigation.navigate("scan");
        }}
        buttonStyle={{
          backgroundColor: "#0069b4",
          borderWidth: 3,
          borderColor: "#0069b4",
          borderRadius: 20,
          width: "100%",
          paddingVertical: 14,
        }}
        titleStyle={{ color: "white", fontSize: 16 }}
        containerStyle={{ padding: 0 }}
      />
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
