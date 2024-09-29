import React from "react";
import { NavigationContainer, useTheme } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";

import * as SplashScreen from "expo-splash-screen";
import MainTabNavigator from "./navigation/MainTabNavigator";

SplashScreen.preventAutoHideAsync();
setTimeout(() => {
  SplashScreen.hideAsync();
}, 2000);

const App = () => {
  const { colors } = useTheme();
  return (
    <NavigationContainer
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <StatusBar style="auto" />
      <MainTabNavigator />
    </NavigationContainer>
  );
};

export default App;
