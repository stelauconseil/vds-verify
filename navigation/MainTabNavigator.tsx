import React, { useState, useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Icon } from "@rneui/themed";
import { getLabel, getLang } from "../components/Label";
import HeaderLogoText from "../components/HeaderLogo";
import Scan from "../screens/Scan";
import InfoStack from "./InfoStack";

type RootTabParamList = {
  scan: undefined;
  settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const MainTabNavigator: React.FC = () => {
  const [lang, setLang] = useState<string | null>(null);

  useEffect(() => {
    const getLangAsync = async () => {
      const l = await getLang();
      setLang(l);
    };
    getLangAsync();
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string | undefined;
          if (route.name === "scan") {
            iconName = focused ? "qr-code-outline" : "qr-code";
          } else {
            iconName = focused ? "settings" : "settings-outline";
          }
          return (
            <Icon type="ionicon" name={iconName} size={size} color={color} />
          );
        },
        tabBarActiveTintColor: "#0069b4",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen
        name="scan"
        options={{ title: getLabel("scan", lang || "en") }}
      >
        {() => <Scan {...{ lang: lang || "en" }} />}
      </Tab.Screen>
      <Tab.Screen
        name="settings"
        options={{ title: getLabel("settings", lang || "en") }}
      >
        {() => <InfoStack {...{ lang: lang || "en", setLang }} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
