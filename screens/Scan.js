import React, { useState, useEffect } from "react";
import { View, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { BarCodeScanner } from "expo-barcode-scanner";
import { encode } from "base-64";
import Constants from "expo-constants";
import { Text, Button } from "@rneui/themed";
import ScannerView from "./ScannerView";
import ResultScreen from "./ResultScreen";
import { getLabel } from "../components/Label";
import * as Linking from "expo-linking";

const Scan = ({ lang }) => {
  const isFocused = useIsFocused();
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [previousLink, setPreviousLink] = useState(null);
  const [link, setLink] = React.useState(null);

  const deepLink = Linking.useURL();
  console.log("deep link: ", deepLink);
  if (
    deepLink !== null &&
    deepLink !== previousLink &&
    link === null &&
    typeof deepLink === "string" &&
    deepLink.startsWith("https://vds-verify.stelau.com/vds#")
  ) {
    const data = deepLink.replace("https://vds-verify.stelau.com/vds#", "");
    setLink(data);
    console.log("previous link: ", previousLink);
    console.log("data received through url: ", data);
  }

  useEffect(() => {
    (async () => {
      setScanned(false);
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const processResult = async ({ type, data }) => {
    const apiUrl = process.env.EXPO_PUBLIC_VDS_API_URL;
    setScanned(true);
    const b64encodedvds = encode(data);
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
      console.error(error);
      setErrorMessage(error.message);
    }
  };

  if (link !== null && !scanned && previousLink !== link) {
    console.log("processing this data: ", link);
    setScanned(true);
    processResult({ data: link });
    setPreviousLink(link);
    setLink(null);
  }

  if (hasPermission === null) {
    return <Text>{getLabel(lang, "camerapermission")}</Text>;
  }
  if (hasPermission === false) {
    return <Text>{getLabel(lang, "cameraerror")}</Text>;
  }

  return (
    <SafeAreaView style={styles.container}>
      {!scanned && hasPermission ? (
        <View style={{ flex: 1 }}>
          {isFocused ? (
            <BarCodeScanner
              barCodeTypes={[
                BarCodeScanner.Constants.BarCodeType.qr,
                BarCodeScanner.Constants.BarCodeType.datamatrix,
              ]}
              onBarCodeScanned={scanned ? undefined : processResult}
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

export default Scan;
