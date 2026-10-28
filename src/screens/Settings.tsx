import SettingsPicker from "@/components/SettingsPicker";
import { ScreenHeading } from "@/components/screen-heading";
import { FC, useEffect } from "react";
import { Alert, Platform, PlatformColor, View } from "react-native";
import { Host, FieldGroup, Icon, ListItem, Switch, Text } from "@expo/ui";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLabel } from "@/components/Label";
import { systemColor } from "@/theme";
import {
    useSettings,
    ColorSchemePref,
    useEffectiveColorScheme,
} from "@/contexts/SettingsContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type SettingsViewProps = {
    navigation: any;
    lang: string;
    setLang: (l: string) => void;
    isFocused?: boolean;
};

const SettingsView: FC<SettingsViewProps> = ({
    navigation,
    isFocused = true,
}) => {
    const {
        lang,
        setLang,
        historyEnabled,
        setHistoryEnabled,
        advancedMode,
        setAdvancedMode,
        colorSchemePref,
        setColorSchemePref,
    } = useSettings();
    const insets = useSafeAreaInsets();
    const scheme = useEffectiveColorScheme();

    useEffect(() => {
        (async () => {
            try {
                const stored = await AsyncStorage.getItem("historyEnabled");
                const enabled = stored !== "false";
                if (enabled !== historyEnabled)
                    await setHistoryEnabled(enabled);
            } catch {
                return;
            }
        })();
    }, [historyEnabled, isFocused, setHistoryEnabled]);

    // Turning history off deletes saved scans, which can't be undone: confirm first.
    const onHistoryToggle = async (enabled: boolean) => {
        const stored = await AsyncStorage.getItem("scanHistory").catch(
            () => null,
        );
        if (enabled || !stored || stored === "[]") {
            void setHistoryEnabled(enabled);
            return;
        }
        Alert.alert(
            getLabel("deleteHistory", lang),
            getLabel("deleteHistoryMessage", lang),
            [
                { text: getLabel("cancel", lang), style: "cancel" },
                {
                    text: getLabel("delete", lang),
                    style: "destructive",
                    onPress: () => void setHistoryEnabled(false),
                },
            ],
            { cancelable: true },
        );
    };

    return (
        <View
            style={{
                flex: 1,
                // Android: the Compose form paints Material `surface`; the heading band must match it.
                // Required lazily: the Compose module is Android-only.
                backgroundColor:
                    Platform.OS === "android"
                        ? require("@expo/ui/jetpack-compose").getMaterialColors(
                              { scheme, seedColor: "#007AFF" },
                          ).surface
                        : systemColor(
                              "systemGroupedBackground",
                              scheme === "dark" ? "#000000" : "#F2F2F7",
                          ),
            }}
        >
            {isFocused && (
                <View style={{ flex: 1 }}>
                    <View
                        style={{
                            paddingLeft: insets.left,
                            paddingRight: insets.right,
                        }}
                    >
                        <ScreenHeading
                            title={getLabel("settings", lang)}
                            color={systemColor(
                                "label",
                                scheme === "dark" ? "#F9FAFB" : "#0F172A",
                            )}
                            topInset={insets.top}
                        />
                    </View>
                    <Host
                        colorScheme={scheme}
                        seedColor="#007AFF"
                        style={{
                            flex: 1,
                            width: "100%",
                            maxWidth: 760,
                            alignSelf: "center",
                            // iOS: the form spans under the side bars (iPhone Duo) and insets its rows itself.
                            ...(Platform.OS !== "ios" && {
                                marginLeft: insets.left,
                                marginRight: insets.right,
                            }),
                            marginBottom:
                                Platform.OS === "ios" ? insets.bottom : 0,
                        }}
                    >
                        <FieldGroup testID="settings-form">
                            <FieldGroup.Section
                                title={getLabel("appearance", lang)}
                            >
                                <SettingsPicker<ColorSchemePref>
                                    label={getLabel("theme", lang)}
                                    testID="theme-picker"
                                    value={colorSchemePref}
                                    onChange={setColorSchemePref}
                                    options={(
                                        ["system", "light", "dark"] as const
                                    ).map((value) => ({
                                        value,
                                        label: getLabel(`theme_${value}`, lang),
                                    }))}
                                />
                                <SettingsPicker
                                    label={getLabel("language", lang)}
                                    testID="language-picker"
                                    value={lang}
                                    onChange={setLang}
                                    options={[
                                        { value: "fr", label: "Français" },
                                        { value: "en", label: "English" },
                                    ]}
                                />
                            </FieldGroup.Section>
                            <FieldGroup.Section
                                title={getLabel("history", lang)}
                            >
                                <Switch
                                    testID="history-toggle"
                                    label={getLabel("historytoggle", lang)}
                                    value={historyEnabled}
                                    onValueChange={onHistoryToggle}
                                />
                            </FieldGroup.Section>
                            <FieldGroup.Section
                                title={getLabel("advanced_options", lang)}
                            >
                                <Switch
                                    testID="advanced-mode-toggle"
                                    label={getLabel("advancedmode", lang)}
                                    value={advancedMode}
                                    onValueChange={setAdvancedMode}
                                />
                                <FieldGroup.SectionFooter>
                                    <Text>
                                        {getLabel("advancedmode_info", lang)}
                                    </Text>
                                </FieldGroup.SectionFooter>
                            </FieldGroup.Section>
                            <FieldGroup.Section
                                title={getLabel("information", lang)}
                            >
                                {(
                                    [
                                        "about",
                                        "faq",
                                        "usepolicy",
                                        "privacypolicy",
                                    ] as const
                                ).map((route) => (
                                    <ListItem
                                        key={route}
                                        // Android: keep the section's card color (surfaceContainer) like the other rows.
                                        colors={
                                            Platform.OS === "ios"
                                                ? {
                                                      containerColor:
                                                          "transparent",
                                                  }
                                                : undefined
                                        }
                                        trailing={
                                            // System disclosure indicator on iOS; Material rows have none.
                                            Platform.OS === "ios" ? (
                                                <Icon
                                                    name="chevron.right"
                                                    size={13}
                                                    color={PlatformColor(
                                                        "tertiaryLabel",
                                                    )}
                                                />
                                            ) : undefined
                                        }
                                        testID={`settings-${route}`}
                                        onPress={() =>
                                            navigation.navigate(route)
                                        }
                                    >
                                        {getLabel(route, lang)}
                                    </ListItem>
                                ))}
                            </FieldGroup.Section>
                        </FieldGroup>
                    </Host>
                </View>
            )}
        </View>
    );
};

export default SettingsView;
