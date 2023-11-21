// import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Button } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Settings from "../screens/Settings";
import About from "../screens/About";
import UsePolicy from "../screens/UsePolicy";
import PrivacyPolicy from "../screens/PrivacyPolicy";
import { getLabel } from "../components/Label";

const Stack = createNativeStackNavigator();

const InfoStack = ({ lang, setLang }) => {
  const navigation = useNavigation();

  return (
    <Stack.Navigator
      initialRouteName="settings"
      // screenOptions={{
      //   headerTintColor: "white",
      //   headerStyle: { backgroundColor: "#0a51a1" },
      // }}
    >
      <Stack.Screen
        name="about"
        options={{
          headerTitle: getLabel(lang, "about"),
          // headerRight: () => (
          //   <Button
          //     onPress={() => navigation.goBack(null)}
          //     title={getLabel(lang, "close")}
          //     // color="#ffffff"
          //   />
          // ),
        }}
      >
        {(props) => <About {...props} {...{ lang }} />}
      </Stack.Screen>
      <Stack.Screen
        name="settings"
        options={{
          headerTitle: getLabel(lang, "settings"),
        }}
      >
        {(props) => <Settings {...props} {...{ lang, setLang }} />}
      </Stack.Screen>
      <Stack.Screen
        name="usepolicy"
        options={{
          headerTitle: getLabel(lang, "usepolicy"),
          // headerRight: () => (
          //   <Button
          //     onPress={() => navigation.goBack(null)}
          //     title={getLabel(lang, "close")}
          //     // color="#ffffff"
          //   />
          // ),
        }}
      >
        {(props) => <UsePolicy {...props} {...{ lang }} />}
      </Stack.Screen>
      <Stack.Screen
        name="privacypolicy"
        options={{
          headerTitle: getLabel(lang, "privacypolicy"),
          // headerRight: () => (
          //   <Button
          //     onPress={() => navigation.goBack(null)}
          //     title={getLabel(lang, "close")}
          //     // color="#ffffff"
          //   />
          // ),
        }}
      >
        {(props) => <PrivacyPolicy {...props} {...{ lang }} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export default InfoStack;
