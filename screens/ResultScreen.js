import { View, ScrollView, Modal, Image } from "react-native";
import { Text, Button, Divider, Icon } from "@rneui/themed";
// import CryptoJS from "crypto-js";
import { getLabel, formatData, isBase64 } from "../components/Label";
import SecurityDetails from "./SecurityDetails";
import PropTypes from "prop-types";

const formatResult = (data, key, lang) => {
  // If data[key] is a string or an array of strings, display it
  // else if data[key] is an object, display its keys and values
  if ((key.includes("Image") || key.includes("photo")) && isBase64(data[key])) {
    // try {
    //   const password = "1234";
    //   CryptoJS.algo.EvpKDF.cfg.hasher = CryptoJS.algo.SHA256.create();
    //   const decryptedData = CryptoJS.AES.decrypt(data[key], password);
    //   return (
    //     <View key={key}>
    //       <Text style={{ color: "gray", fontSize: 14 }}>
    //         {key.charAt(0).toUpperCase() + key.slice(1)}
    //       </Text>
    //       <Image
    //         style={{
    //           width: 100,
    //           height: 100,
    //         }}
    //         source={{
    //           uri:
    //             "data:image/webp;base64," +
    //             decryptedData.toString(CryptoJS.enc.Base64),
    //         }}
    //       />
    //     </View>
    //   );
    // } catch (e) {
    return (
      <View key={key}>
        <Text style={{ color: "gray", fontSize: 14 }}>
          {key.charAt(0).toUpperCase() + key.slice(1)}
        </Text>
        <Image
          style={{
            width: 100,
            height: 130,
          }}
          source={{
            uri: "data:image/webp;base64," + data[key],
          }}
        />
      </View>
    );
    // }
  } else if (
    (typeof data[key] === "string" && data[key] !== "") ||
    typeof data[key] === "number" ||
    (Array.isArray(data[key]) &&
      data[key].every((e) => typeof e === "string" || typeof e === "number"))
  ) {
    return (
      <View key={key}>
        <Text style={{ color: "gray", fontSize: 14 }}>
          {key.charAt(0).toUpperCase() + key.slice(1)}
        </Text>
        <Text
          style={{
            color: "#0069b4",
            fontWeight: "bold",
            marginBottom: 10,
            fontSize: 16,
          }}
        >
          {formatData(data[key], lang)}
        </Text>
      </View>
    );
  } else if (data[key] != null && typeof data[key] === "object") {
    return (
      <View key={key}>
        {isNaN(key) && (
          <Text style={{ color: "gray", fontSize: 14 }}>
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </Text>
        )}
        <View style={{ marginLeft: 10 }}>
          {Object.keys(data[key])
            // .filter((k) => {
            //   return k !== null && k !== undefined && k !== "";
            // })
            .map((k) => formatResult(data[key], k), lang)}
        </View>
      </View>
    );
    // }
  } else {
    return;
  }
};

const ResultScreen = ({
  result,
  lang,
  setResult,
  setScanned,
  modalVisible,
  setModalVisible,
  navigation,
}) => {
  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "white",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      {result.testdata && (
        <View
          style={{
            width: "100%",
            backgroundColor: "#ff95a1",
            padding: 2,
            borderWidth: 3,
            borderColor: "#ff95a1",
          }}
        >
          <Text
            h4={true}
            h4Style={{
              textAlign: "center",
              fontVariant: "small-caps",
              color: "red",
            }}
          >
            {getLabel("testdata", lang)}
          </Text>
        </View>
      )}
      <ScrollView
        style={{ paddingHorizontal: "5%", paddingTop: 5, paddingBottom: 0 }}
      >
        <Text
          h3={true}
          h3Style={{
            color: "#0069b4",
          }}
        >
          {result.header["Type de document"]}
        </Text>
        <Divider style={{ marginVertical: 10 }} />
        {/* <Text
          h4={true}
          key="data"
          h4style={{
            color: "black",
            marginVertical: 10,
          }}
          style={{ fontVariant: "small-caps" }}
        >
          {getLabel( "data")}
        </Text> */}
        {Object.keys(result.data)
          .filter((key) => {
            return (
              result.data[key] !== null &&
              result.data[key] !== undefined &&
              result.data[key] !== ""
            );
          })
          .map((key) => formatResult(result.data, key, lang))}
      </ScrollView>
      <Button
        onPress={() => openModal()}
        title={
          result.sign_is_valid && result.signer
            ? getLabel("valid", lang)
            : result.signer
              ? getLabel("invalid", lang)
              : getLabel("nonverifiable", lang)
        }
        icon={
          <Icon
            name="chevron-up-circle-outline"
            type="ionicon"
            color={
              result.sign_is_valid && result.signer
                ? "green"
                : result.signer
                  ? "red"
                  : "orange"
            }
          />
        }
        iconRight={true}
        buttonStyle={{
          backgroundColor:
            result.sign_is_valid && result.signer
              ? "#d3fdc5"
              : result.signer
                ? "#ff95a1"
                : "#ffcc99",
          borderWidth: 3,
          borderTopRightRadius: 20,
          borderTopLeftRadius: 20,
          borderColor:
            result.sign_is_valid && result.signer
              ? "#d3fdc5"
              : result.signer
                ? "#ff95a1"
                : "#ffcc99",
          width: "100%",
        }}
        titleStyle={{
          flex: 1,
          textAlign: "center",
          color:
            result.sign_is_valid && result.signer
              ? "green"
              : result.signer
                ? "red"
                : "orange",
        }}
        containerStyle={{
          paddingLeft: 0,
          paddingRight: 0,
          paddingBottom: 0,
          paddingTop: 0,
        }}
      />
      <Button
        title={getLabel("scanagain", lang)}
        buttonStyle={{
          backgroundColor: "#0069b4",
          borderWidth: 3,
          borderColor: "#0069b4",
          borderRadius: 0,
          width: "100%",
          // marginTop: 10,
        }}
        containerStyle={{
          padding: 0,
          // paddingBottom: 0,
        }}
        titleStyle={{ color: "white" }}
        onPress={() => {
          setResult(null);
          setScanned(false);
          navigation.navigate("scan");
        }}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
        swipeDirection="down" // Enable swipe down to close the modal
        onSwipeComplete={closeModal} // Handle swipe down event
      >
        <SecurityDetails result={result} lang={lang} closeModal={closeModal} />
      </Modal>
    </View>
  );
};

ResultScreen.propTypes = {
  result: PropTypes.object.isRequired,
  lang: PropTypes.string.isRequired,
  setResult: PropTypes.func.isRequired,
  setScanned: PropTypes.func.isRequired,
  modalVisible: PropTypes.bool.isRequired,
  setModalVisible: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
};

export default ResultScreen;
