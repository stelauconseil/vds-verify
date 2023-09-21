import React, { useState, useEffect } from "react";
import { View, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import { getLocales } from "expo-localization";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { encode } from "base-64";
import { Text, Button } from "@rneui/themed";
import label from "./Label";

SplashScreen.preventAutoHideAsync();
setTimeout(SplashScreen.hideAsync, 2000);

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [locale, setLocale] = useState(React.useState(getLocales() || "en"));

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    };
    getBarCodeScannerPermissions();
  }, []);

  const getLabel = (key) => {
    if (label[locale[0][0].languageCode]) {
      return label[locale[0][0].languageCode][key];
    }
    return label.en[key];
  };

  const formatData = (data) => {
    try {
      if (Array.isArray(data)) {
        return data.join(" ");
      } else {
        let newdate = Date.parse(data);
        if (newdate > 1000) {
          const d = new Date(newdate);
          if (d.toString() !== "Invalid Date") {
            const dateString = d.toLocaleDateString(getLabel("code"));
            if (!d.toUTCString().includes("00:00:00")) {
              return dateString + " " + d.toLocaleTimeString(getLabel("code"));
            }
            return dateString;
          }
          return data;
        } else {
          throw new Error("not a date");
        }
      }
    } catch (error) {
      return data;
    }
  };

  const processResult = async ({ type, data }) => {
    const apiUrl = process.env.EXPO_PUBLIC_VDS_API_URL;
    setScanned(true);
    console.log(`loaded data`, data);
    const b64encodedvds = encode(data);
    try {
      console.log(`b64encodedvds`, b64encodedvds);
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
      console.log(`success, message, vds`, success, message, vds);
      if (success === true) {
        setResult(vds);
      } else {
        throw new Error(message);
      }
    } catch (error) {
      console.log(`error`, error);
      setErrorMessage(error.message);
    }
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <>
      {scanned ? (
        <>
          {!!result && (
            <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
              <ScrollView style={{ paddingHorizontal: "10%" }}>
                <Text
                  h1={true}
                  h1Style={{
                    color: "#0a51a1",
                    alignSelf: "center",
                    marginBottom: 20,
                  }}
                >
                  {getLabel(result.header["Type de document"])}
                </Text>
                {!!result.data
                  ? Object.keys(result).map((part, index) => {
                      return (
                        <>
                          <Text
                            h3={true}
                            key={index}
                            h3Style={{
                              color: "black",
                              marginTop: 10,
                              marginBottom: 5,
                            }}
                          >
                            {getLabel(part)}
                          </Text>
                          {typeof result[part] !== "string" ? (
                            Object.keys(result[part]).map((key, i) => {
                              return (
                                <>
                                  <Text key={i}>{key} :</Text>
                                  <Text
                                    style={{
                                      color: "#0a51a1",
                                      fontWeight: "bold",
                                      marginBottom: 5,
                                      fontSize: 16,
                                    }}
                                  >
                                    {formatData(result[part][key])}
                                  </Text>
                                </>
                              );
                            })
                          ) : (
                            <>
                              <Text
                                key={index + 1}
                                style={{
                                  color: "#0a51a1",
                                  fontWeight: "bold",
                                }}
                              >
                                ✅ {result[part]}
                              </Text>
                            </>
                          )}
                        </>
                      );
                    })
                  : ""}
              </ScrollView>
              <Button
                title={getLabel("scanagain")}
                buttonStyle={{
                  backgroundColor: "#0a51a1",
                  borderWidth: 2,
                  borderColor: "#0a51a1",
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
            </SafeAreaView>
          )}
          {!!errorMessage && (
            <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
              <Text
                h1={true}
                h1Style={{
                  color: "#0a51a1",
                  alignSelf: "center",
                  marginBottom: 50,
                }}
              >
                ⚠️ {getLabel("error")}
              </Text>
              <Text style={{ color: "#0a51a1", alignSelf: "center" }}>
                {errorMessage}
              </Text>
              <Button
                title={getLabel("scanagain")}
                buttonStyle={{
                  textcolor: "white",
                  backgroundColor: "#0a51a1",
                  // borderWidth: 0,
                  // borderColor: "#0a51a1",
                  borderRadius: 30,
                }}
                containerStyle={{
                  marginHorizontal: "25%",
                }}
                titleStyle={{ fontWeight: "bold", color: "white" }}
                onPress={() => {
                  setResult(null);
                  setErrorMessage(null);
                  setScanned(false);
                }}
              />
            </SafeAreaView>
          )}
        </>
      ) : (
        <>
          {console.log("camera", hasPermission)}
          <View style={styles.container}>
            <BarCodeScanner
              barCodeTypes={[
                BarCodeScanner.Constants.BarCodeType.qr,
                BarCodeScanner.Constants.BarCodeType.datamatrix,
              ]}
              onBarCodeScanned={scanned ? undefined : processResult}
              style={StyleSheet.absoluteFillObject}
            />
            <StatusBar style="light" />
          </View>
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
});
