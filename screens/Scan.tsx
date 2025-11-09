import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  useNavigation,
  useIsFocused,
  useRoute,
} from "@react-navigation/native";
import { CameraView, useCameraPermissions } from "expo-camera";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Text, Button } from "@rneui/themed";
import ScannerView from "./ScannerView";
import ResultScreen from "./ResultScreen";
import { getLabel } from "../components/Label";
import * as Linking from "expo-linking";
import { Buffer } from "buffer";
import type { VdsResult } from "../types/vds";

type ScanProps = { lang?: string };

const Scan: React.FC<ScanProps> = ({ lang }) => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const { result: initialResult } = (route as any).params || {};
  const [result, setResult] = useState<VdsResult | null>(null);
  const [scanned, setScanned] = useState<boolean>(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);

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

  // Hide tab bar when showing the result overlay
  useEffect(() => {
    const parent = (navigation as any).getParent?.();
    if (parent) {
      parent.setOptions({
        tabBarStyle: scanned && result ? { display: "none" } : undefined,
      });
    }
  }, [navigation, scanned, result]);

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
            h1
            h1Style={{
              color: "#0069b4",
              alignSelf: "center",
              marginTop: 50,
              marginBottom: 50,
            }}
          >
            ⚠️ {getLabel("error", lang)}
          </Text>
          <Text style={{ color: "#0069b4", alignSelf: "center", fontSize: 20 }}>
            {getLabel("cameraerror", lang)}
          </Text>
        </ScrollView>
        <Button
          title={getLabel("camerapermission", lang)}
          buttonStyle={{
            backgroundColor: "#0069b4",
            borderWidth: 2,
            borderColor: "#0069b4",
            width: "100%",
          }}
          containerStyle={{ paddingTop: 5, paddingBottom: 0 }}
          titleStyle={{ color: "white" }}
          onPress={Linking.openSettings}
        />
      </View>
    );
  }

  return (
    <>
      {isFocused && (
        <View style={styles.container}>
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
              <View style={styles.helpTextWrapper}>
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
                      h1
                      h1Style={{
                        color: "#0069b4",
                        alignSelf: "center",
                        marginTop: 50,
                        marginBottom: 50,
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
                  <Button
                    title={getLabel("scanagain", lang)}
                    buttonStyle={{
                      backgroundColor: "#0069b4",
                      borderWidth: 2,
                      borderColor: "#0069b4",
                      width: "100%",
                    }}
                    containerStyle={{ paddingTop: 5, paddingBottom: 0 }}
                    titleStyle={{ color: "white" }}
                    onPress={async () => {
                      try {
                        navigation.setParams({ result: undefined } as any);
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
