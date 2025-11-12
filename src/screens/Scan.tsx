import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, ScrollView, Text } from "react-native";
import {
  useNavigation,
  useIsFocused,
  useRoute,
} from "@react-navigation/native";
import { CameraView, useCameraPermissions } from "expo-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button } from "../components/Button";
import ScannerView from "./ScannerView";
import ResultScreen from "./ResultScreen";
import { getLabel } from "../components/Label";
import * as Linking from "expo-linking";
import { Buffer } from "buffer";
import type { VdsResult } from "../types/vds";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ScanProps = { lang?: string };

const Scan: React.FC<ScanProps> = ({ lang }) => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const {
    result: initialResult,
    showStatus,
    resetScan,
    resultStatus: statusFromParams,
  } = (route as any).params || {};
  const [result, setResult] = useState<VdsResult | null>(null);
  const [scanned, setScanned] = useState<boolean>(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (initialResult && typeof initialResult === "object") {
      setResult(initialResult as VdsResult);
      setScanned(true);
    }
  }, [initialResult]);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [firstUrl, setFirstUrl] = useState<boolean>(true);
  const [url, setUrl] = useState<string | null>(null);

  const onChange = (event: { url: string }) => setUrl(event.url);

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const { status } = await requestPermission();
        if (status !== "granted") {
          setErrorMessage("error_camera_permission");
        }
      } catch {
        setErrorMessage("error_camera_permission");
      }
    };
    getCameraPermission();
    return () => {
      if (cameraRef.current?.stopAsync) {
        cameraRef.current.stopAsync();
      }
    };
  }, [requestPermission]);

  useEffect(() => {
    Linking.getInitialURL().then((u) => setUrl(u as string | null));
    setFirstUrl(false);
  }, [firstUrl]);

  // Show global NativeTabs; no local hiding logic needed

  // Hide tab bar when showing the result overlay
  // When a result is present, push its status to tab bar via setOptions
  useEffect(() => {
    if (result) {
      const status: "valid" | "invalid" | "nonverifiable" =
        result.sign_is_valid && result.signer
          ? "valid"
          : result.signer
            ? "invalid"
            : "nonverifiable";
      // Keep current status if provided via params (e.g., on status icon press)
      navigation.setParams({ resultStatus: statusFromParams || status });
    } else {
      navigation.setParams({ resultStatus: undefined });
    }
  }, [result, statusFromParams, navigation]);

  // Pick a status to display on the top bar when a result exists
  const displayStatus: "valid" | "invalid" | "nonverifiable" | undefined =
    result
      ? statusFromParams ||
        (result.sign_is_valid && result.signer
          ? "valid"
          : result.signer
            ? "invalid"
            : "nonverifiable")
      : undefined;

  useEffect(() => {
    const subscription: any = Linking.addEventListener("url", onChange);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (
      url !== null &&
      typeof url === "string" &&
      (url.startsWith("http") || url.startsWith("vds"))
    ) {
      processResult({ data: url });
      setUrl(null);
    }
  }, [url]);

  // Open status modal when requested from tab bar
  useEffect(() => {
    if (showStatus && result) {
      setModalVisible(true);
      // don't clear resultStatus; only clear the trigger
      navigation.setParams({ showStatus: undefined } as any);
    }
  }, [showStatus, result, navigation]);

  // Reset scanning when scan tab is pressed while a result exists
  useEffect(() => {
    if (resetScan) {
      navigation.setParams({
        resetScan: undefined,
        result: undefined,
        resultStatus: undefined,
      } as any);
      setResult(null);
      setScanned(false);
      setErrorMessage(null);
    }
  }, [resetScan, navigation]);

  const parseData = (data: string): string | null => {
    if (data?.startsWith("http")) {
      const lastIndex = data.lastIndexOf("/vds#");
      if (lastIndex === -1 || lastIndex === data.length - 1) return null;
      return Buffer.from(data.substring(lastIndex + 5)).toString("base64");
    } else if (data.startsWith("vds")) {
      return Buffer.from(data.substring(6)).toString("base64");
    } else {
      return Buffer.from(data).toString("base64");
    }
  };

  const processResult = async ({ data }: { data: string }) => {
    const apiUrl = process.env.EXPO_PUBLIC_VDS_API_URL as string;
    setScanned(true);
    const b64encodedvds = parseData(data);
    if (b64encodedvds === null) {
      setErrorMessage("error_invalid_qr");
      return;
    }
    try {
      const response = await fetch(`${apiUrl}/api/v1/decode`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ vds: b64encodedvds }),
      });
      const { success, message, vds } = await response.json();
      if (success === true) {
        const historyEnabled =
          (await AsyncStorage.getItem("historyEnabled")) !== "false";
        if (historyEnabled) {
          const history = JSON.parse(
            (await AsyncStorage.getItem("scanHistory")) || "[]"
          );
          const newEntry = { timestamp: new Date().toISOString(), data: vds };
          history.unshift(newEntry);
          await AsyncStorage.setItem("scanHistory", JSON.stringify(history));
        }
        setResult(vds as VdsResult);
      } else {
        setErrorMessage(message);
      }
    } catch (error: any) {
      setErrorMessage(error.message);
    }
  };

  if (!permission) {
    return <View />;
  }

  if (!permission?.granted) {
    return (
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <ScrollView style={{ paddingHorizontal: "5%" }}>
          <Text
            style={{
              color: "#0069b4",
              alignSelf: "center",
              marginTop: 50,
              marginBottom: 50,
              fontSize: 32,
              fontWeight: "700",
            }}
          >
            ⚠️ {getLabel("error", lang)}
          </Text>
          <Text style={{ color: "#0069b4", alignSelf: "center", fontSize: 20 }}>
            {getLabel("cameraerror", lang)}
          </Text>
        </ScrollView>
        <View style={{ paddingHorizontal: 10, paddingBottom: 10 }}>
          <Button
            title={getLabel("camerapermission", lang)}
            onPress={() => Linking.openSettings()}
          />
        </View>
      </View>
    );
  }

  return (
    <>
      {isFocused && (
        <View style={styles.container}>
          {/* Local overlay removed in favor of global NativeTabs */}
          {!scanned && permission ? (
            <View style={{ flex: 1 }}>
              <CameraView
                ref={cameraRef}
                zoom={0.15}
                barcodeScannerSettings={{
                  barcodeTypes: ["qr", "datamatrix", "aztec"],
                }}
                onBarcodeScanned={scanned ? undefined : (processResult as any)}
                style={StyleSheet.absoluteFillObject}
              />
              <View
                style={[
                  styles.helpTextWrapper,
                  { bottom: Math.max(insets.bottom, 8) + 8 + 70 },
                ]}
              >
                <Text style={styles.helpText}>
                  {getLabel("helpscan", lang)}
                </Text>
              </View>
              <View style={styles.content}>
                <ScannerView scanned={scanned} />
              </View>
            </View>
          ) : (
            <>
              {scanned && result && (
                <ResultScreen
                  result={result}
                  lang={lang || "en"}
                  setResult={setResult}
                  setScanned={setScanned}
                  modalVisible={modalVisible}
                  setModalVisible={setModalVisible}
                  navigation={navigation}
                />
              )}
              {!!errorMessage && (
                <View style={{ flex: 1, backgroundColor: "white" }}>
                  <ScrollView style={{ paddingHorizontal: "5%" }}>
                    <Text
                      style={{
                        color: "#0069b4",
                        alignSelf: "center",
                        marginTop: 50,
                        marginBottom: 50,
                        fontSize: 32,
                        fontWeight: "700",
                      }}
                    >
                      ⚠️ {getLabel("error", lang)}
                    </Text>
                    <Text
                      style={{
                        color: "#0069b4",
                        alignSelf: "center",
                        fontSize: 20,
                      }}
                    >
                      {getLabel(errorMessage, lang)}
                    </Text>
                  </ScrollView>
                  <View style={{ paddingHorizontal: 10, paddingBottom: 10 }}>
                    <Button
                      title={getLabel("scanagain", lang)}
                      onPress={async () => {
                        try {
                          navigation.setParams({
                            result: undefined,
                            resultStatus: undefined,
                          } as any);
                          if (cameraRef.current?.stopAsync) {
                            await cameraRef.current.stopAsync();
                          }
                          setResult(null);
                          setScanned(false);
                          setErrorMessage(null);
                        } catch {
                          setErrorMessage("error_resetting_scan");
                        }
                      }}
                    />
                  </View>
                </View>
              )}
            </>
          )}
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  content: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  helpTextWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  helpText: {
    color: "#ffffff",
  },
});

export default Scan;
