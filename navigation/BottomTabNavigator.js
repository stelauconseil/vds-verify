import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import HeaderLogoText from "../components/HeaderLogo";
import Scan from "../screens/Scan";
import Settings from "../screens/Settings";
import { getLabel, getLang } from "../components/Label";

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  const [lang, setLang] = React.useState(null);

  React.useEffect(() => {
    const getLangAsync = async () => {
      const l = await getLang();
      setLang(l);
    };
    getLangAsync();
  }, []);

  // const [useScan, setUseScan] = React.useState(false);
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
        // listeners={{ focus: () => setuseScan(false) }}
        options={{
          headerTitle: () => <HeaderLogoText />,
          title: getLabel(lang, "scan"),
        }}
      >
        {() => (
          <Scan
            // useScan={useScan}
            settings={{ lang }}
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Settings" // listeners={{ focus: () => setuseScan(true) }}
        options={{
          headerTitle: () => <HeaderLogoText />,
          title: getLabel(lang, "settings"),
        }}
      >
        {() => (
          <Settings
            // useScan={useScan}
            settings={{ lang, setLang }}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
