import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SettingsView from "../screens/SettingsView";
import About from "../screens/About";
import UsePolicy from "../screens/UsePolicy";
import PrivacyPolicy from "../screens/PrivacyPolicy";
import Faq from "../screens/Faq";
import HistoryScreen from "../screens/HistoryScreen";
import { getLabel } from "../components/Label";
import PropTypes from "prop-types";

const Stack = createNativeStackNavigator();

const InfoStack = ({ lang, setLang }) => {
  return (
    <Stack.Navigator
      initialRouteName="settingsView"
      screenOptions={{
        headerTitleAlign: "center",
        // headerTintColor: "white",
        // headerStyle: { backgroundColor: "#0069b4" },
      }}
    >
      <Stack.Screen
        name="settingsView"
        options={{
          headerTitle: getLabel("settings", lang),
          headerTitleAlign: "center",
        }}
      >
        {(props) => <SettingsView {...props} {...{ lang, setLang }} />}
      </Stack.Screen>
      <Stack.Screen
        name="about"
        options={{
          headerTitle: getLabel("about", lang),
          headerTitleAlign: "center",
        }}
      >
        {(props) => <About {...props} {...{ lang }} />}
      </Stack.Screen>
      <Stack.Screen
        name="faq"
        options={{
          headerTitle: getLabel("faq", lang),
          headerTitleAlign: "center",
        }}
      >
        {(props) => <Faq {...props} {...{ lang }} />}
      </Stack.Screen>
      <Stack.Screen
        name="usepolicy"
        options={{
          headerTitle: getLabel("usepolicy", lang),
          headerTitleAlign: "center",
        }}
      >
        {(props) => <UsePolicy {...props} {...{ lang }} />}
      </Stack.Screen>
      <Stack.Screen
        name="privacypolicy"
        options={{
          headerTitle: getLabel("privacypolicy", lang),
          headerTitleAlign: "center",
        }}
      >
        {(props) => <PrivacyPolicy {...props} {...{ lang }} />}
      </Stack.Screen>
      <Stack.Screen
        name="history"
        options={{
          headerTitle: getLabel("history", lang),
          headerTitleAlign: "center",
        }}
      >
        {(props) => <HistoryScreen {...props} {...{ lang }} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

InfoStack.propTypes = {
  lang: PropTypes.string.isRequired,
  setLang: PropTypes.func.isRequired,
};

export default InfoStack;
