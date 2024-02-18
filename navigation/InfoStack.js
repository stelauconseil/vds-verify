import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Settings from "../screens/Settings";
import About from "../screens/About";
import UsePolicy from "../screens/UsePolicy";
import PrivacyPolicy from "../screens/PrivacyPolicy";
import Faq from "../screens/Faq";
import { getLabel } from "../components/Label";
import PropTypes from "prop-types";

const Stack = createNativeStackNavigator();

const InfoStack = ({ lang, setLang }) => {
  return (
    <Stack.Navigator
      initialRouteName="settings"
      screenOptions={{
        headerTitleAlign: "center",
        // headerTintColor: "white",
        // headerStyle: { backgroundColor: "#0069b4" },
      }}
    >
      <Stack.Screen
        name="about"
        options={{
          headerTitle: getLabel(lang, "about"),
          headerTitleAlign: "center",
        }}
      >
        {(props) => <About {...props} {...{ lang }} />}
      </Stack.Screen>
      <Stack.Screen
        name="faq"
        options={{
          headerTitle: getLabel(lang, "faq"),
          headerTitleAlign: "center",
        }}
      >
        {(props) => <PrivacyPolicy {...props} {...{ lang }} />}
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
          headerTitleAlign: "center",
        }}
      >
        {(props) => <UsePolicy {...props} {...{ lang }} />}
      </Stack.Screen>
      <Stack.Screen
        name="privacypolicy"
        options={{
          headerTitle: getLabel(lang, "privacypolicy"),
          headerTitleAlign: "center",
        }}
      >
        {(props) => <PrivacyPolicy {...props} {...{ lang }} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

InfoStack.propTypes = {
  lang: PropTypes.string.isRequired,
  setLang: PropTypes.func.isRequired,
};

export default InfoStack;
