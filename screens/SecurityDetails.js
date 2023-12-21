import React from "react";
import { View, ScrollView, StyleSheet, Pressable } from "react-native";
import { Text, Button, Divider, Icon } from "@rneui/themed";
import { getLabel, formatData } from "../components/Label";
import PropTypes from "prop-types";

const get_standard = (vds_standard) => {
  switch (vds_standard) {
    case "DOC_ISO22376_2023":
      return "ISO 22376:2023";
    case "DOC_105":
      return "AFNOR 105";
    case "DOC_101":
      return "2D-Doc";
    default:
      return "2D-Doc";
  }
};

const SecurityDetails = ({ result, lang, closeModal }) => {
  return (
    <View style={styles.centeredView}>
      <View style={styles.modalView}>
        <ScrollView>
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
              name="checkmark-circle-outline"
              type="ionicon"
              // size={15}
              color="green"
              style={{ marginRight: 10 }}
            />
            {getLabel(lang, "signer")}
          </Text>
          {Object.keys(result.signer).map((key) => {
            return (
              <React.Fragment key={key}>
                <Text style={{ marginBottom: 5 }}>
                  {getLabel(lang, key)} :{" "}
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
              </React.Fragment>
            );
          })}
          <Divider style={{ marginVertical: 10 }} />
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
              // size={15}
              color="gray"
              style={{ marginRight: 10 }}
            />
            {getLabel(lang, "header")}
          </Text>
          {Object.keys(result.header).map((key) => {
            return (
              <React.Fragment key={key}>
                <Text style={{ marginBottom: 5 }}>
                  {getLabel(lang, key)}:{" "}
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
              </React.Fragment>
            );
          })}
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
              // size={15}
              color="gray"
              style={{ marginRight: 10 }}
            />
            {getLabel(lang, "standard")}
          </Text>
          <Text key="compliance">
            {getLabel(lang, "compliance")}:{" "}
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
        </ScrollView>
        <View style={{ width: "100%", paddingBottom: 10 }}>
          <Pressable>
            <Button
              onPress={() => closeModal()}
              // onPressIn={() => navigation.navigate("Security Details")}
              title={getLabel(lang, "close")}
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
  lang: PropTypes.string.isRequired,
  closeModal: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 82,
    marginBottom: 75,
  },
  modalView: {
    margin: 10,
    backgroundColor: "white",
    borderRadius: 20,
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
