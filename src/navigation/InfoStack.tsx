import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import SettingsView from "../screens/Settings";
import About from "../screens/About";
import UsePolicy from "../screens/UsePolicy";
import PrivacyPolicy from "../screens/PrivacyPolicy";
import Faq from "../screens/Faq";
import HistoryScreen from "../screens/HistoryScreen";
import { getLabel } from "../components/Label";

type InfoStackParamList = {
  settingsView: undefined;
  about: undefined;
  faq: undefined;
  usepolicy: undefined;
  privacypolicy: undefined;
  history: undefined;
};

type InfoStackProps = {
  lang: string;
  setLang: (l: string) => void;
};

const Stack = createNativeStackNavigator<InfoStackParamList>();

const InfoStack: React.FC<InfoStackProps> = ({ lang, setLang }) => {
  return (
    <Stack.Navigator
      initialRouteName="settingsView"
      screenOptions={{ headerTitleAlign: "center" }}
    >
      <Stack.Screen
        name="settingsView"
        options={({ navigation }) => ({
          headerTitle: getLabel("settings", lang),
          headerTitleAlign: "center",
          headerBackButtonDisplayMode: "minimal",
          headerLeft: () => (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={getLabel("scan", lang)}
              onPress={() => navigation.navigate("scan" as never)}
              style={{ paddingHorizontal: 6 }}
            >
              <Ionicons name="chevron-back-outline" size={24} color="#0069b4" />
            </TouchableOpacity>
          ),
        })}
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

export default InfoStack;
