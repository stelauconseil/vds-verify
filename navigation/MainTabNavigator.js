import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Icon } from "@rneui/themed";
import { getLabel, getLang } from "../components/Label";
import HeaderLogoText from "../components/HeaderLogo";
import Scan from "../screens/Scan";
import InfoStack from "./InfoStack";

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  const [lang, setLang] = React.useState(null);

  React.useEffect(() => {
    const getLangAsync = async () => {
      const l = await getLang();
      setLang(l);
    };
    getLangAsync();
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "scan") {
            iconName = focused ? "qr-code-outline" : "qr-code";
          } else if (route.name === "options") {
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
          title: getLabel(lang, "scan"),
        }}
      >
        {() => <Scan {...{ lang }} />}
      </Tab.Screen>
      <Tab.Screen
        name="options"
        options={{
          headerTitle: () => <HeaderLogoText />,
          headerTitleAlign: "center",
          title: getLabel(lang, "settings"),
        }}
      >
        {() => <InfoStack {...{ lang, setLang }} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
