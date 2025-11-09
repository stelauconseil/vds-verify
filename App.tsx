import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import MainTabNavigator from "./src/navigation/MainTabNavigator";

SplashScreen.preventAutoHideAsync();

setTimeout(() => {
  SplashScreen.hideAsync();
}, 2000);

const App: React.FC = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <StatusBar style="auto" />
        <MainTabNavigator />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default App;
