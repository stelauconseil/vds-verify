import React from "react";
import { useNavigation } from "@react-navigation/native";
import { View, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import { Text, Button } from "@rneui/themed";
import { getLabel } from "../components/Label";

const formatData = (data) => {
  try {
    if (Array.isArray(data)) {
      return data.join(" ");
    } else {
      let newdate = Date.parse(data);
      if (newdate > 1000) {
        const d = new Date(newdate);
        if (d.toString() !== "Invalid Date") {
          const dateString = d.toLocaleDateString(
            getLabel(lang, "languageTag")
          );
          if (!d.toUTCString().includes("00:00:00")) {
            return `${dateString} ${d.toLocaleTimeString(
              getLabel(lang, "languageTag")
            )}`;
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

const ResultScreen = ({
  result,
  lang,
  setResult,
  setErrorMessage,
  setScanned,
}) => {
  const navigation = useNavigation();
  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView style={{ paddingHorizontal: "5%" }}>
        <Text
          h3={true}
          h3Style={{
            color: "#0069b4",
            // alignSelf: "left",
            marginBottom: 10,
          }}
        >
          {result.header["Type de document"]}
        </Text>
        {result.data
          ? Object.keys(result).map((part, index) => {
              return (
                <>
                  <Text
                    h4={true}
                    key={index}
                    h4Style={{
                      color: "black",
                      marginTop: 10,
                      marginBottom: 5,
                    }}
                  >
                    {getLabel(lang, part)}
                  </Text>
                  {typeof result[part] !== "string" ? (
                    Object.keys(result[part]).map((key, i) => {
                      return (
                        <>
                          <Text key={i}>
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                          </Text>
                          <Text
                            style={{
                              color: "#0069b4",
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
                          color: "#0069b4",
                          fontWeight: "bold",
                        }}
                      >
                        ✅ {result["signer"]}
                      </Text>
                      <Text
                        key={index + 2}
                        style={{
                          color: "#0069b4",
                          fontWeight: "bold",
                        }}
                      >
                        {result["vds_standard"] == "DOC_ISO22376_2023"
                          ? "ISO 22376:2023"
                          : result["vds_standard"] == "105"
                          ? "AFNOR 105"
                          : "2D-Doc"}
                      </Text>
                      <Button
                        onPress={() => navigation.navigate("Signature Details")}
                        title={result["signer"]}
                      />
                    </>
                  )}
                </>
              );
            })
          : ""}
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
          navigation.navigate("scan");
        }}
      />
    </View>
  );
};

export default ResultScreen;
