import React, { Fragment } from "react";
import { View, ScrollView, StyleSheet, Pressable, Text } from "react-native";
import { Divider } from "@rneui/themed";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { Button as NativeUIButton } from "../components/Button";
import { getLabel, formatData } from "../components/Label";
import type { VdsResult } from "../types/vds";

const get_standard = (vds_standard?: string): string => {
  switch (vds_standard) {
    case "DOC_ISO22376_2023":
      return "ISO 22376:2023";
    case "DOC_105":
      return "AFNOR XP Z42 105";
    case "DOC_101":
      return "AFNOR XP Z42 101 - 104";
    default:
      return vds_standard ?? "";
  }
};

type Props = {
  result: VdsResult;
  lang: string;
  closeModal: () => void;
};

const SectionTitle: React.FC<{
  iconName: string;
  iconColor?: string;
  label: string;
}> = ({ iconName, iconColor = "gray", label }) => (
  <View style={styles.sectionTitleContainer}>
    <Ionicons name={iconName as any} type="ionicon" color={iconColor} />
    <Text style={styles.sectionTitleText}>{label}</Text>
  </View>
);

const SecurityDetails: React.FC<Props> = ({ result, lang, closeModal }) => {
  return (
    <View style={styles.centeredView}>
      <View style={styles.modalView}>
        <ScrollView contentContainerStyle={{ paddingBottom: 10 }}>
          <SectionTitle
            iconName="browsers-outline"
            label={getLabel("header", lang)}
          />
          {Object.keys(result.header).map(
            (key) =>
              result.header[key] !== null && (
                <Fragment key={key}>
                  <Text style={{ marginBottom: 5 }}>
                    {getLabel(key, lang)}:{" "}
                    <Text
                      style={{
                        color: "#0069b4",
                        fontWeight: "bold",
                        fontSize: 14,
                        lineHeight: 30,
                      }}
                    >
                      {formatData(result.header[key], lang)}
                    </Text>
                  </Text>
                </Fragment>
              )
          )}
          <Divider style={{ marginVertical: 10 }} />

          <SectionTitle
            iconName={
              result.sign_is_valid && result.signer
                ? "checkmark-circle-outline"
                : "alert-circle-outline"
            }
            iconColor={
              result.sign_is_valid && result.signer
                ? "green"
                : result.signer
                  ? "red"
                  : "orange"
            }
            label={getLabel("signer", lang)}
          />
          {result.signer ? (
            Object.keys(result.signer).map((key) => (
              <Fragment key={key}>
                <Text style={{ marginBottom: 5 }}>
                  {getLabel(key, lang)}:{" "}
                  <Text
                    style={{
                      color: "#0069b4",
                      fontWeight: "bold",
                      fontSize: 14,
                      lineHeight: 30,
                    }}
                  >
                    {formatData(result.signer?.[key], lang)}
                  </Text>
                </Text>
              </Fragment>
            ))
          ) : (
            <Text style={{ marginTop: 5, marginBottom: 5 }}>
              {getLabel("sign_not_verified", lang)}
            </Text>
          )}

          <Divider style={{ marginVertical: 10 }} />
          <SectionTitle
            iconName="build-outline"
            label={getLabel("standard", lang)}
          />
          <Text key="compliance">
            {getLabel("compliance", lang)}:{" "}
            <Text
              key="vds_standard"
              style={{
                color: "#0069b4",
                fontWeight: "bold",
                fontSize: 14,
                lineHeight: 30,
              }}
            >
              {get_standard(result.vds_standard)}
            </Text>
          </Text>
          <Text>&nbsp;</Text>
        </ScrollView>
        <View style={{ width: "100%", paddingBottom: 10 }}>
          <Pressable>
            <NativeUIButton
              onPress={closeModal}
              title={getLabel("close", lang)}
              variant="primary"
              containerStyle={{ width: "100%" }}
              titleStyle={{ color: "white", fontSize: 16 }}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  modalView: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "white",
    borderRadius: 20,
    paddingTop: 20,
    padding: 20,
    paddingBottom: 0,
    alignItems: "stretch",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 5,
  },
  sectionTitleText: { fontSize: 20, color: "black", marginLeft: 8 },
});

export default SecurityDetails;
