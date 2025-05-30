import React, { useState, useEffect } from "react";
import { View, StyleSheet, SafeAreaView, ScrollView } from "react-native";
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
import PropTypes from "prop-types";

const Scan = ({ lang }) => {
  const route = useRoute();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { result: initialResult } = route.params || {}; // Access the result parameter
  const [result, setResult] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = React.useRef(null);

  // Handle initial result from navigation
  React.useEffect(() => {
    if (initialResult && typeof initialResult === "object") {
      // Process the result if it's valid
      setResult(initialResult);
      setScanned(true);
    }
  }, [initialResult]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [firstUrl, setFirstUrl] = useState(true);
  const [url, setUrl] = useState(null);

  const onChange = (event) => {
    setUrl(event.url);
  };

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const { status } = await requestPermission();
        if (status !== "granted") {
          setErrorMessage("error_camera_permission");
        }
      } catch (error) {
        console.error("Camera permission error:", error);
        setErrorMessage("error_camera_permission");
      }
    };

    getCameraPermission();

    return () => {
      // Cleanup camera
      if (cameraRef.current) {
        cameraRef.current.stopAsync();
      }
    };
  }, [requestPermission]);

  // This effect is now handled in the component initialization above
  // Removed to prevent duplicate state updates

  useEffect(() => {
    Linking.getInitialURL().then((url) => setUrl(url));
    setFirstUrl(false);
  }, [firstUrl]);

  useEffect(() => {
    const subscription = Linking.addEventListener("url", onChange);
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

  const parseData = (data) => {
    if (data?.startsWith("http")) {
      const lastIndex = data.lastIndexOf("/vds#");
      if (lastIndex === -1 || lastIndex === data.length - 1) {
        return null;
      }
      return Buffer.from(data.substring(lastIndex + 5)).toString("base64");
    } else if (data.startsWith("vds")) {
      return Buffer.from(data.substring(6)).toString("base64");
    } else {
      return Buffer.from(data).toString("base64");
    }
  };

  const processResult = async ({ data }) => {
    const apiUrl = process.env.EXPO_PUBLIC_VDS_API_URL;
    setScanned(true);
    let b64encodedvds = parseData(data);
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
        body: JSON.stringify({
          vds: b64encodedvds,
        }),
      });

      const { success, message, vds } = await response.json();
      if (success === true) {
        // Only save to history if historyEnabled is true in AsyncStorage
        const historyEnabled =
          (await AsyncStorage.getItem("historyEnabled")) !== "false";
        if (historyEnabled) {
          const history =
            JSON.parse(await AsyncStorage.getItem("scanHistory")) || [];
          const newEntry = { timestamp: new Date().toISOString(), data: vds };
          history.unshift(newEntry);
          await AsyncStorage.setItem("scanHistory", JSON.stringify(history));
        }
        setResult(vds);
      } else {
        setErrorMessage(message);
      }
    } catch (error) {
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
            h1={true}
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
          containerStyle={{
            paddingTop: 5,
            paddingBottom: 0,
          }}
          titleStyle={{ color: "white" }}
          onPress={Linking.openSettings}
        />
      </View>
    );
  }

  return (
    <>
      {isFocused && (
        <SafeAreaView style={styles.container}>
          {!scanned && permission ? (
            <View style={{ flex: 1 }}>
              <CameraView
                ref={cameraRef}
                zoom={0.15}
                barcodeScannerSettings={{
                  barcodeTypes: ["qr", "datamatrix", "aztec"],
                }}
                onBarcodeScanned={scanned ? undefined : processResult}
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
                  lang={lang}
                  setResult={setResult}
                  setErrorMessage={setErrorMessage}
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
                      h1={true}
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
                    containerStyle={{
                      paddingTop: 5,
                      paddingBottom: 0,
                    }}
                    titleStyle={{ color: "white" }}
                    onPress={async () => {
                      try {
                        // Clear navigation state
                        navigation.setParams({
                          result: undefined,
                        });

                        // Stop camera if it's running
                        if (cameraRef.current) {
                          await cameraRef.current.stopAsync();
                        }

                        // Clear local state
                        await Promise.all([
                          setResult(null),
                          setScanned(false),
                          setErrorMessage(null),
                        ]);
                      } catch (error) {
                        console.error("Error resetting scan state:", error);
                        setErrorMessage("error_resetting_scan");
                      }
                    }}
                  />
                </View>
              )}
            </>
          )}
        </SafeAreaView>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
    backgroundColor: "#ffffff",
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

Scan.propTypes = {
  lang: PropTypes.string,
};

export default Scan;
