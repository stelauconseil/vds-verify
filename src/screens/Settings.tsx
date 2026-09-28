import SettingsPicker from "@/components/SettingsPicker";
import { ScreenHeading } from "@/components/screen-heading";
import { FC, useEffect } from "react";
import { Platform, View } from "react-native";
import {
    Host,
    FieldGroup,
    ListItem,
    Switch,
    Row,
    Spacer,
    Text,
} from "@expo/ui";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLabel } from "@/components/Label";
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

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: scheme === "dark" ? "#000000" : "#F2F2F7",
            }}
        >
            {isFocused && (
                <View
                    style={{
                        flex: 1,
                        paddingLeft: insets.left,
                        paddingRight: insets.right,
                    }}
                >
                    <ScreenHeading
                        title={getLabel("settings", lang)}
                        color={scheme === "dark" ? "#F9FAFB" : "#0F172A"}
                        topInset={insets.top}
                    />
                    <Host
                        colorScheme={scheme}
                        seedColor="#007AFF"
                        style={{
                            flex: 1,
                            width: "100%",
                            maxWidth: 760,
                            alignSelf: "center",
                            marginBottom:
                                Platform.OS === "ios" ? insets.bottom : 0,
                        }}
                    >
                        <FieldGroup testID="settings-form">
                            <FieldGroup.Section
                                title={getLabel("appearance", lang)}
                            >
                                <Row spacing={12} alignment="center">
                                    <Text>{getLabel("theme", lang)}</Text>
                                    <Spacer flexible />
                                    <SettingsPicker<ColorSchemePref>
                                        testID="theme-picker"
                                        value={colorSchemePref}
                                        onChange={setColorSchemePref}
                                        options={(
                                            ["system", "light", "dark"] as const
                                        ).map((value) => ({
                                            value,
                                            label: getLabel(
                                                `theme_${value}`,
                                                lang,
                                            ),
                                        }))}
                                    />
                                </Row>
                                <Row spacing={12} alignment="center">
                                    <Text>{getLabel("language", lang)}</Text>
                                    <Spacer flexible />
                                    <SettingsPicker
                                        testID="language-picker"
                                        value={lang}
                                        onChange={setLang}
                                        options={[
                                            { value: "fr", label: "Français" },
                                            { value: "en", label: "English" },
                                        ]}
                                    />
                                </Row>
                            </FieldGroup.Section>
                            <FieldGroup.Section
                                title={getLabel("history", lang)}
                            >
                                <Switch
                                    testID="history-toggle"
                                    label={getLabel("historytoggle", lang)}
                                    value={historyEnabled}
                                    onValueChange={setHistoryEnabled}
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
                                        colors={{
                                            containerColor: "transparent",
                                        }}
                                        trailing="›"
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
