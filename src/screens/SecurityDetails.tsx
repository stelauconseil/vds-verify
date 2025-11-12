import React, { Fragment } from "react";
import { View, ScrollView, StyleSheet, Text } from "react-native";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { Button } from "../components/Button";
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
          {/* Header section */}
          <SectionTitle
            iconName="browsers-outline"
            label={getLabel("header", lang)}
          />
          <View style={styles.sectionCard}>
            {Object.keys(result.header).map(
              (key, idx, arr) =>
                result.header[key] !== null && (
                  <Fragment key={key}>
                    <View style={styles.kvRow}>
                      <Text style={styles.kvLabel}>{getLabel(key, lang)}</Text>
                      <Text style={styles.kvValue}>
                        {formatData(result.header[key], lang) as any}
                      </Text>
                    </View>
                    {idx < arr.length - 1 && (
                      <View style={styles.rowSeparator} />
                    )}
                  </Fragment>
                )
            )}
          </View>

          {/* Signature section */}
          <SectionTitle
            iconName={
              result.sign_is_valid && result.signer
                ? "checkmark-circle-outline"
                : "alert-circle-outline"
            }
            iconColor={
              result.sign_is_valid && result.signer
                ? "#34C759"
                : result.signer
                  ? "#FF3B30"
                  : "#FF9500"
            }
            label={getLabel("signer", lang)}
          />
          <View style={styles.sectionCard}>
            {result.signer ? (
              Object.keys(result.signer).map((key, idx, arr) => (
                <Fragment key={key}>
                  <View style={styles.kvRow}>
                    <Text style={styles.kvLabel}>{getLabel(key, lang)}</Text>
                    <Text style={styles.kvValue}>
                      {formatData(result.signer?.[key], lang) as any}
                    </Text>
                  </View>
                  {idx < arr.length - 1 && <View style={styles.rowSeparator} />}
                </Fragment>
              ))
            ) : (
              <View style={styles.kvRowSingle}>
                <Text style={styles.kvLabel}>
                  {getLabel("sign_not_verified", lang)}
                </Text>
              </View>
            )}
          </View>

          {/* Standard section */}
          <SectionTitle
            iconName="build-outline"
            label={getLabel("standard", lang)}
          />
          <View style={styles.sectionCard}>
            <View style={styles.kvRow}>
              <Text style={styles.kvLabel}>{getLabel("compliance", lang)}</Text>
              <Text style={styles.kvValue}>
                {get_standard(result.vds_standard)}
              </Text>
            </View>
          </View>
        </ScrollView>
        <View style={{ width: "100%", paddingBottom: 10 }}>
          <Button onPress={closeModal} title={getLabel("close", lang)} />
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
    paddingTop: 10,
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
  sectionCard: {
    backgroundColor: "#F2F2F7",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
  },
  kvRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 6,
  },
  kvRowSingle: {
    paddingVertical: 6,
  },
  kvLabel: {
    color: "#6B7280",
    fontSize: 14,
    flexShrink: 1,
  },
  kvValue: {
    color: "#0069b4",
    fontWeight: "600",
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 8,
    flexShrink: 1,
    textAlign: "right",
  },
  rowSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E5E7EB",
    marginVertical: 4,
  },
});

export default SecurityDetails;
