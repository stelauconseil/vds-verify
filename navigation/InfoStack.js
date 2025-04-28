import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SettingsView from "../screens/SettingsView";
import About from "../screens/About";
import UsePolicy from "../screens/UsePolicy";
import PrivacyPolicy from "../screens/PrivacyPolicy";
import Faq from "../screens/Faq";
import HistoryScreen from "../screens/HistoryScreen";
import { getLabel } from "../components/Label";

const Stack = createNativeStackNavigator();

const InfoStack = () => {
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
          headerTitle: getLabel("settings"),
          headerTitleAlign: "center",
        }}
      >
        {(props) => <SettingsView {...props} />}
      </Stack.Screen>
      <Stack.Screen
        name="about"
        options={{
          headerTitle: getLabel("about"),
          headerTitleAlign: "center",
        }}
      >
        {(props) => <About {...props} />}
      </Stack.Screen>
      <Stack.Screen
        name="faq"
        options={{
          headerTitle: getLabel("faq"),
          headerTitleAlign: "center",
        }}
      >
        {(props) => <Faq {...props} />}
      </Stack.Screen>
      <Stack.Screen
        name="usepolicy"
        options={{
          headerTitle: getLabel("usepolicy"),
          headerTitleAlign: "center",
        }}
      >
        {(props) => <UsePolicy {...props} />}
      </Stack.Screen>
      <Stack.Screen
        name="privacypolicy"
        options={{
          headerTitle: getLabel("privacypolicy"),
          headerTitleAlign: "center",
        }}
      >
        {(props) => <PrivacyPolicy {...props} />}
      </Stack.Screen>
      <Stack.Screen
        name="history"
        options={{
          headerTitle: getLabel("history"),
          headerTitleAlign: "center",
        }}
      >
        {(props) => <HistoryScreen {...props} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export default InfoStack;
