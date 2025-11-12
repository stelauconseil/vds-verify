import React, { useState, useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import CustomTabBar from "./CustomTabBar";
import { getLabel, getLang } from "../components/Label";
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
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#0069b4",
        tabBarInactiveTintColor: "gray",
      })}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen
        name="scan"
        options={({ route }) => ({
          title: getLabel("scan", lang || "en"),
          // Allow Scan screen to push status into options for CustomTabBar via setOptions
          // Default values
          resultStatus: (route.params as any)?.resultStatus,
        })}
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
