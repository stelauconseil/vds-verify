import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
// import { LanguageProvider } from "./LanguageContext";
import { StatusBar } from "expo-status-bar";

import * as SplashScreen from "expo-splash-screen";
import MainTabNavigator from "./navigation/MainTabNavigator";

SplashScreen.preventAutoHideAsync();

setTimeout(() => {
  SplashScreen.hideAsync();
}, 2000);

const App = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer style={{ flex: 1 }}>
        <StatusBar style="auto" />
        <MainTabNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
