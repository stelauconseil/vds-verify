import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import MainTabNavigator from "./navigation/MainTabNavigator";

SplashScreen.preventAutoHideAsync();

setTimeout(() => {
  SplashScreen.hideAsync();
}, 2000);

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <MainTabNavigator />
    </NavigationContainer>
  );
};

export default App;
