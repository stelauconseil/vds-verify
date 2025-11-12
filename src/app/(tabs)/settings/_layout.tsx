import { Stack } from "expo-router";
import { getLabel } from "../../../components/Label";
import { useSettings } from "../../../contexts/SettingsContext";

export default function SettingsLayout() {
  const { lang } = useSettings();

  return (
    <Stack
      screenOptions={{
        headerTitleAlign: "center",
        headerBackButtonDisplayMode: "minimal",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: getLabel("settings", lang),
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="about"
        options={{
          title: getLabel("about", lang),
        }}
      />
      <Stack.Screen
        name="faq"
        options={{
          title: getLabel("faq", lang),
        }}
      />
      <Stack.Screen
        name="usepolicy"
        options={{
          title: getLabel("usepolicy", lang),
        }}
      />
      <Stack.Screen
        name="privacypolicy"
        options={{
          title: getLabel("privacypolicy", lang),
        }}
      />
    </Stack>
  );
}
