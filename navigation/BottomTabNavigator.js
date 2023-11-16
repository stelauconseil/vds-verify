import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import HeaderLogoText from "../components/HeaderLogo";
import Scan from "../screens/Scan";
import Settings from "../screens/Settings";

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Scan") {
            iconName = focused ? "qr-code-outline" : "qr-code";
          } else if (route.name === "Settings") {
            iconName = focused ? "settings" : "settings-outline";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#0a51a1",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen
        name="Scan"
        component={Scan}
        options={{
          headerTitle: () => <HeaderLogoText />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={Settings}
        options={{
          headerTitle: () => <HeaderLogoText />,
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
