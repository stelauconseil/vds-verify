import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import BottomTabNavigator from "./navigation/BottomTabNavigator";

SplashScreen.preventAutoHideAsync();
setTimeout(() => {
  SplashScreen.hideAsync();
}, 2000);

// export default
const App = () => {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <BottomTabNavigator />
    </NavigationContainer>
  );
};

export default App;
