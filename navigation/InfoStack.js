import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SettingsView from "../screens/Settings";
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
          headerBackButtonDisplayMode: "minimal",
        }}
      >
        {(props) => (
          <SettingsView key={"settings"} {...props} {...{ lang, setLang }} />
        )}
      </Stack.Screen>
      <Stack.Screen
        name="about"
        options={{
          headerTitle: getLabel("about", lang),
          headerTitleAlign: "center",
          headerBackButtonDisplayMode: "minimal",
        }}
      >
        {(props) => <About key={"about"} {...props} {...{ lang }} />}
      </Stack.Screen>
      <Stack.Screen
        name="faq"
        options={{
          headerTitle: getLabel("faq", lang),
          headerTitleAlign: "center",
          headerBackButtonDisplayMode: "minimal",
        }}
      >
        {(props) => <Faq key={"faq"} {...props} {...{ lang }} />}
      </Stack.Screen>
      <Stack.Screen
        name="usepolicy"
        options={{
          headerTitle: getLabel("usepolicy", lang),
          headerTitleAlign: "center",
          headerBackButtonDisplayMode: "minimal",
        }}
      >
        {(props) => <UsePolicy key={"usepolicy"} {...props} {...{ lang }} />}
      </Stack.Screen>
      <Stack.Screen
        name="privacypolicy"
        options={{
          headerTitle: getLabel("privacypolicy", lang),
          headerTitleAlign: "center",
          headerBackButtonDisplayMode: "minimal",
        }}
      >
        {(props) => (
          <PrivacyPolicy key={"privacypolicy"} {...props} {...{ lang }} />
        )}
      </Stack.Screen>
      <Stack.Screen
        name="history"
        options={{
          headerTitle: getLabel("history", lang),
          headerTitleAlign: "center",
          headerBackButtonDisplayMode: "minimal",
        }}
      >
        {(props) => <HistoryScreen key={"history"} {...props} {...{ lang }} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

InfoStack.propTypes = {
  lang: PropTypes.string.isRequired,
  setLang: PropTypes.func.isRequired,
};

export default InfoStack;
