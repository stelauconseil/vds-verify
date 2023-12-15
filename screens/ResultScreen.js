import { View, ScrollView, Modal } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Text, Button, Divider, Icon } from "@rneui/themed";
import { getLabel, formatData } from "../components/Label";
import SecurityDetails from "./SecurityDetails";

const ResultScreen = ({
  result,
  lang,
  setResult,
  setScanned,
  modalVisible,
  setModalVisible,
}) => {
  const navigation = useNavigation();

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView
        style={{ paddingHorizontal: "5%", paddingBottom: 10 }}
        containerStyle={{
          paddingTop: 5,
          paddingBottom: 0,
        }}
      >
        <Text
          h3={true}
          h3Style={{
            color: "#0069b4",
            marginBottom: 10,
          }}
        >
          {result.header["Type de document"]}
        </Text>
        <Divider style={{ marginVertical: 10 }} />
        <Text
          h4={true}
          key="data"
          h4style={{
            color: "black",
            marginVertical: 10,
          }}
          style={{ fontVariant: "small-caps" }}
        >
          {getLabel(lang, "data")}
        </Text>
        {Object.keys(result.data).map((key, i) => (
          <View key={i}>
            <Text style={{ color: "grey", fontSize: 14 }}>
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
              {formatData(result.data[key], lang)}
            </Text>
          </View>
        ))}
      </ScrollView>
      <Button
        onPress={() => openModal()}
        // onPressIn={() => navigation.navigate("Security Details")}
        title={getLabel(lang, "valid")}
        icon={
          <Icon
            name="chevron-up-circle-outline"
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
          borderTopRightRadius: 20,
          borderTopLeftRadius: 20,
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
          paddingTop: 20,
        }}
      />
      <Button
        title={getLabel(lang, "scanagain")}
        buttonStyle={{
          backgroundColor: "#0069b4",
          borderRadius: 0,
          // borderWidth: 0,
          // borderColor: "#0069b4",
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

export default ResultScreen;
