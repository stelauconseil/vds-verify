import React, { useState, useEffect } from "react";
import { View, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { CameraView, useCameraPermissions } from "expo-camera";
import Constants from "expo-constants";
import { Text, Button } from "@rneui/themed";
import ScannerView from "./ScannerView";
import ResultScreen from "./ResultScreen";
import { getLabel } from "../components/Label";
import * as Linking from "expo-linking";
import PropTypes from "prop-types";
import { Buffer } from "buffer";

const Scan = ({ lang }) => {
  const isFocused = useIsFocused();

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [firstUrl, setFirstUrl] = useState(true);
  const [url, setUrl] = React.useState(null);

  const navigation = useNavigation();

  const onChange = (event) => {
    setUrl(event.url);
  };

  useEffect(() => {
    requestPermission();
  });

  useEffect(() => {
    Linking.getInitialURL().then((url) => setUrl(url));
    setFirstUrl(false);
  }, [firstUrl]);

  useEffect(() => {
    const subscription = Linking.addEventListener("url", onChange);
    return () => subscription.remove();
  }, []);

  const parseData = (data) => {
    if (data.startsWith("http")) {
      const lastIndex = data.lastIndexOf("/vds#");
      if (lastIndex === -1 || lastIndex === data.length - 1) {
        return null;
      }
      return Buffer.from(data.substring(lastIndex + 5)).toString("base64");
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
        setResult(vds);
      } else {
        setErrorMessage(message);
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  if (url !== null && typeof url === "string" && url.startsWith("http")) {
    processResult({ data: url });
    setUrl(null);
  }

  if (!permission) {
    // Camera permissions are still loading
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
            ⚠️ {getLabel(lang, "error")}
          </Text>
          <Text
            style={{
              color: "#0069b4",
              alignSelf: "center",
              fontSize: 20,
            }}
          >
            {getLabel(lang, "cameraerror")}
          </Text>
        </ScrollView>
        <Button
          title={getLabel(lang, "camerapermission")}
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
    <SafeAreaView style={styles.container}>
      {!scanned && permission ? (
        <View style={{ flex: 1 }}>
          {isFocused ? (
            <CameraView
              // zoom={0.01}
              barcodeScannerSettings={{
                barcodeTypes: ["qr", "datamatrix"],
              }}
              onBarcodeScanned={scanned ? undefined : processResult}
              style={StyleSheet.absoluteFillObject}
            />
          ) : null}
          <View style={styles.helpTextWrapper}>
            <Text style={styles.helpText}>{getLabel(lang, "helpscan")}</Text>
          </View>
          <View style={styles.content}>
            <ScannerView scanned={scanned} />
          </View>
        </View>
      ) : (
        <>
          {result &&
            ResultScreen({
              result,
              lang,
              setResult,
              setErrorMessage,
              setScanned,
              modalVisible,
              setModalVisible,
              navigation,
            })}
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
                  ⚠️ {getLabel(lang, "error")}
                </Text>
                <Text
                  style={{
                    color: "#0069b4",
                    alignSelf: "center",
                    fontSize: 20,
                  }}
                >
                  {getLabel(lang, errorMessage)}
                </Text>
              </ScrollView>
              <Button
                title={getLabel(lang, "scanagain")}
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
                onPress={() => {
                  setResult(null);
                  setErrorMessage(null);
                  setScanned(false);
                }}
              />
            </View>
          )}
        </>
      )}
    </SafeAreaView>
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
    color: "#fff",
  },
});

Scan.propTypes = {
  lang: PropTypes.string,
};

export default Scan;
