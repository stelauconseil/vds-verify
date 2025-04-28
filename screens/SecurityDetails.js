import React, { Fragment } from "react";
import { View, ScrollView, StyleSheet, Pressable } from "react-native";
import { Text, Button, Divider, Icon } from "@rneui/themed";
import { getLabel, formatData } from "../components/Label";
import PropTypes from "prop-types";

const get_standard = (vds_standard) => {
  switch (vds_standard) {
    case "DOC_ISO22376_2023":
      return "ISO 22376:2023";
    case "DOC_105":
      return "AFNOR XP Z42 105";
    case "DOC_101":
      return "AFNOR XP Z42 101 - 104";
    default:
      return vds_standard;
  }
};

const SecurityDetails = ({ result, lang, closeModal }) => {
  return (
    <View style={styles.centeredView}>
      <View style={styles.modalView}>
        <ScrollView>
          <Text
            h4={true}
            key="header"
            h4Style={{
              color: "black",
              marginTop: 10,
              marginBottom: 5,
            }}
            style={{ fontVariant: "small-caps", marginBottom: 5 }}
          >
            <Icon
              name="browsers-outline"
              type="ionicon"
              color="gray"
              style={{ marginRight: 10 }}
            />
            {getLabel("header")}
          </Text>
          {Object.keys(result.header).map((key) => {
            return (
              result.header[key] !== null && (
                <Fragment key={key}>
                  <Text style={{ marginBottom: 5 }}>
                    {getLabel(key)}:{" "}
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
            );
          })}
          <Divider style={{ marginVertical: 10 }} />
          <Text
            h4={true}
            key="signer"
            h4style={{
              color: "black",
              marginVertical: 10,
            }}
            style={{ fontVariant: "small-caps", marginBottom: 5 }}
          >
            <Icon
              name={
                // result.signer
                result.sign_is_valid && result.signer
                  ? "checkmark-circle-outline"
                  : "alert-circle-outline"
              }
              type="ionicon"
              // color={result.signer ? "green" : "orange"}
              color={
                result.sign_is_valid && result.signer
                  ? "green"
                  : result.signer
                    ? "red"
                    : "orange"
              }
              style={{ marginRight: 10 }}
            />
            {getLabel("signer")}
          </Text>
          {result.signer ? (
            Object.keys(result.signer).map((key) => {
              return (
                <Fragment key={key}>
                  <Text style={{ marginBottom: 5 }}>
                    {getLabel(key)}:{" "}
                    <Text
                      style={{
                        color: "#0069b4",
                        fontWeight: "bold",
                        fontSize: 14,
                        lineHeight: 30,
                      }}
                    >
                      {formatData(result.signer[key], lang)}
                    </Text>
                  </Text>
                </Fragment>
              );
            })
          ) : (
            <Text style={{ marginTop: 5, marginBottom: 5 }}>
              {getLabel("sign_not_verified")}
            </Text>
          )}
          <Divider style={{ marginVertical: 10 }} />
          <Text
            h4={true}
            key="standard"
            h4Style={{
              color: "black",
              marginTop: 10,
              marginBottom: 5,
            }}
            style={{ fontVariant: "small-caps", marginBottom: 5 }}
          >
            <Icon
              name="build-outline"
              type="ionicon"
              color="gray"
              style={{ marginRight: 10 }}
            />
            {getLabel("standard")}
          </Text>
          <Text key="compliance">
            {getLabel("compliance")}:{" "}
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
            <Button
              onPress={() => closeModal()}
              title={getLabel("close")}
              icon={
                <Icon
                  name="close-circle-outline"
                  type="ionicon"
                  // size={15}
                  color="white"
                  style={{ marginLeft: 10 }}
                />
              }
              iconLeft={true}
              buttonStyle={{
                backgroundColor: "#0069b4",
                borderWidth: 3,
                borderRadius: 20,
                borderColor: "#0069b4",
                width: "100%",
              }}
              titleStyle={{
                flex: 1,
                textAlign: "center",
                color: "white",
              }}
              containerStyle={{
                paddingLeft: 0,
                paddingRight: 0,
                paddingBottom: 0,
                paddingTop: 0,
              }}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
};

SecurityDetails.propTypes = {
  result: PropTypes.object.isRequired,
  lang: PropTypes.string,
  closeModal: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 90,
    marginBottom: 75,
  },
  modalView: {
    margin: 10,
    backgroundColor: "white",
    borderRadius: 20,
    paddingTop: 20,
    padding: 35,
    paddingBottom: 0,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 0,
    elevation: 2,
    borderWidth: 3,
    // borderBottomRightRadius: 20,
    // borderBottomLeftRadius: 20,
    // borderColor: "#d3fdc5",
    width: "100%",
  },
  // buttonOpen: {
  //   backgroundColor: "#F194FF",
  // },
  // buttonClose: {
  //   backgroundColor: "#2196F3",
  // },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
});

export default SecurityDetails;
