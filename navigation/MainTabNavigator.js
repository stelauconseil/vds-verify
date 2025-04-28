import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Icon } from "@rneui/themed";
import { getLabel } from "../components/Label";
import HeaderLogoText from "../components/HeaderLogo";
import Scan from "../screens/Scan";
import InfoStack from "./InfoStack";

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "scan") {
            iconName = focused ? "qr-code-outline" : "qr-code";
          } else if (route.name === "settings") {
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
        options={{
          headerTitle: () => <HeaderLogoText />,
          headerTitleAlign: "center",
          title: getLabel("scan"),
        }}
      >
        {() => <Scan />}
      </Tab.Screen>
      <Tab.Screen
        name="settings"
        options={{
          headerTitle: () => <HeaderLogoText />,
          headerTitleAlign: "center",
          title: getLabel("settings"),
        }}
      >
        {() => <InfoStack />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
