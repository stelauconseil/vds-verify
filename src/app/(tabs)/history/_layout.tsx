import { Stack } from "expo-router";
import { Platform } from "react-native";
import { getLabel } from "@/components/Label";
import { useSettings } from "@/contexts/SettingsContext";

// iOS gets the native large title, search bar and toolbar; Android keeps its in-screen heading.
export default function HistoryLayout() {
    const { lang } = useSettings();

    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    title: getLabel("history", lang),
                    headerShown: Platform.OS === "ios",
                    headerLargeTitle: true,
                    headerTransparent: true,
                }}
            />
        </Stack>
    );
}
