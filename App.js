import React, { useState, useEffect } from "react";
import { Text, View, Button, StyleSheet } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import { StatusBar } from "expo-status-bar";
import { encode } from "base-64";

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    alert(`Bar code with type ${type} and data ${data} has been scanned!`);
  };

  const processResult = async ({ type, data }) => {
    setScanned(true);
    console.log(`loaded data`, data);
    const b64encodedvds = encode(data);
    try {
      console.log(`b64encodedvds`, b64encodedvds);
      const response = await fetch(`http://192.168.50.12:8000/api/v1/decode`, {
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
        // alert(`${vds}`);
        setShowDialog(true);
      } else {
        throw new Error(message);
      }
    } catch (error) {
      console.log(`error`, error);
      setErrorMessage(error);
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
      {console.log("showDialog", showDialog)}
      {showDialog ? (
        <>
          {!!result && (
            // Object.keys(result).length(
            <View className="flex-1 items-center justify-center bg-white">
              <Text key="title">VDS Type</Text>
              <Text key="type">VDS</Text>
              {!!result.data
                ? Object.keys(result.data).map((key, index) => {
                    return (
                      <>
                        {console.log(key, result.data[key])}
                        <Text key={key}>
                          {key} : {result.data[key]}
                        </Text>
                      </>
                    );
                  })
                : ""}
              <Button
                onPress={() => {
                  setResult(null);
                  setErrorMessage(null);
                  setShowDialog(false);
                  setScanned(false);
                  // setProcessing(false);
                }}
                title="Scan Again"
                color="#841584"
                accessibilityLabel="Close"
              />
            </View>
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
