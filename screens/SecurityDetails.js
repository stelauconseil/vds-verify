import React from "react";
import { View, ScrollView, StyleSheet, Pressable } from "react-native";
import { Text, Button, Divider, Icon } from "@rneui/themed";
import { getLabel, formatData } from "../components/Label";

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
            style={{ fontVariant: "small-caps" }}
          >
            {getLabel(lang, "signer")}
          </Text>
          {Object.keys(result.signer).map((key, i) => {
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
                  {formatData(result.signer[key], lang)}
                </Text>
              </>
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
            style={{ fontVariant: "small-caps" }}
          >
            {getLabel(lang, "header")}
          </Text>
          {Object.keys(result.header).map((key, i) => {
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
                  {formatData(result.header[key], lang)}
                </Text>
              </>
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
            style={{ fontVariant: "small-caps" }}
          >
            {getLabel(lang, "standard")}
          </Text>
          <Text key="compliance">
            {getLabel(lang, "compliance").charAt(0).toUpperCase() +
              getLabel(lang, "compliance").slice(1)}
          </Text>
          <Text
            key="vds_standard"
            style={{
              color: "#0069b4",
              fontWeight: "bold",
              marginBottom: 5,
              fontSize: 16,
            }}
          >
            {result.vds_standard == "DOC_ISO22376_2023"
              ? "ISO 22376:2023"
              : result.vds_standard == "105"
              ? "AFNOR 105"
              : "2D-Doc"}
          </Text>
        </ScrollView>
        <View style={{ width: "100%" }}>
          <Pressable>
            <Button
              onPress={() => closeModal()}
              // onPressIn={() => navigation.navigate("Security Details")}
              title={getLabel(lang, "valid")}
              icon={
                <Icon
                  name="chevron-down-circle-outline"
                  type="ionicon"
                  // size={15}
                  color="green"
                  style={{ marginLeft: 10 }}
                />
              }
              iconRight={true}
              buttonStyle={{
                backgroundColor: "#d3fdc5",
                borderWidth: 3,
                borderBottomRightRadius: 20,
                borderBottomLeftRadius: 20,
                borderColor: "#d3fdc5",
                width: "100%",
              }}
              titleStyle={{
                flex: 1,
                textAlign: "center",
                color: "green",
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

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 30,
  },
  modalView: {
    margin: 20,
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
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
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
