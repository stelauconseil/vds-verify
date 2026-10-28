import {
    Platform,
    DynamicColorIOS,
    ColorValue,
    ImageSourcePropType,
} from "react-native";
import { NativeTabs } from "expo-router/native-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";
import { theme } from "@/theme";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { useThemeColor } from "@/components/Themed";
import { getLabel } from "@/components/Label";
import {
    useSettings,
    useEffectiveColorScheme,
} from "@/contexts/SettingsContext";

// Todo (betomoedano): In the future we can remove this type. Learn more: https://exponent-internal.slack.com/archives/C0447EFTS74/p1758042759724779?thread_ts=1758039375.241799&cid=C0447EFTS74
type VectorIconFamily = {
    getImageSource: (
        name: string,
        size: number,
        color: ColorValue,
    ) => Promise<ImageSourcePropType>;
};

export default function TabsLayout() {
    const { lang, colorSchemePref } = useSettings();
    const scheme = useEffectiveColorScheme();
    // Only use DynamicColorIOS when following system — otherwise fix the color to the chosen scheme
    const screenBg =
        Platform.OS === "ios" && colorSchemePref === "system"
            ? DynamicColorIOS({ light: "#FFFFFF", dark: "#000000" })
            : scheme === "dark"
              ? "#000000"
              : "#FFFFFF";
    const tabBarBg =
        Platform.OS === "ios" && colorSchemePref === "system"
            ? DynamicColorIOS({ light: "#F2F2F7", dark: "#1C1C1E" })
            : scheme === "dark"
              ? "#1C1C1E"
              : "#F2F2F7";
    const tintColor = useThemeColor(theme.color.text);
    const inactiveTintColor = useThemeColor({
        light: "#00000090",
        dark: "#FFFFFF90",
    });
    const labelSelectedStyle =
        Platform.OS === "ios" ? { color: tintColor } : undefined;

    return (
        <NativeTabs
            backgroundColor={tabBarBg}
            badgeBackgroundColor={tintColor}
            labelStyle={{
                color:
                    Platform.OS === "ios" && isLiquidGlassAvailable()
                        ? DynamicColorIOS({
                              light: theme.colorBlack,
                              dark: theme.colorWhite,
                          })
                        : inactiveTintColor,
            }}
            iconColor={
                Platform.OS === "ios" && isLiquidGlassAvailable()
                    ? DynamicColorIOS({
                          light: theme.colorBlack,
                          dark: theme.colorWhite,
                      })
                    : inactiveTintColor
            }
            // Monochrome: saturated color is reserved for the scan verdict.
            tintColor={Platform.OS === "ios" ? tintColor : inactiveTintColor}
            labelVisibilityMode="labeled"
            indicatorColor={tintColor + "25"}
            disableTransparentOnScrollEdge={true} // Used to prevent transparent background on iOS 18 and older
        >
            <NativeTabs.Trigger
                name="index"
                contentStyle={{ backgroundColor: screenBg }}
            >
                {Platform.select({
                    ios: <NativeTabs.Trigger.Icon sf="qrcode" />,
                    android: (
                        <NativeTabs.Trigger.Icon
                            src={
                                <NativeTabs.Trigger.VectorIcon
                                    family={Ionicons as VectorIconFamily}
                                    name="qr-code-outline"
                                />
                            }
                            selectedColor={tintColor}
                        />
                    ),
                })}
                <NativeTabs.Trigger.Label>
                    {getLabel("scan", lang || "en")}
                </NativeTabs.Trigger.Label>
            </NativeTabs.Trigger>

            {/* Always visible (HIG: never hide tabs); the screen explains when history is off */}
            <NativeTabs.Trigger
                name="history"
                contentStyle={{ backgroundColor: screenBg }}
            >
                {Platform.select({
                    ios: <NativeTabs.Trigger.Icon sf="archivebox" />,
                    android: (
                        <NativeTabs.Trigger.Icon
                            src={
                                <NativeTabs.Trigger.VectorIcon
                                    family={Ionicons as VectorIconFamily}
                                    name="archive-outline"
                                />
                            }
                            selectedColor={tintColor}
                        />
                    ),
                })}
                <NativeTabs.Trigger.Label selectedStyle={labelSelectedStyle}>
                    {getLabel("history", lang || "en")}
                </NativeTabs.Trigger.Label>
            </NativeTabs.Trigger>

            <NativeTabs.Trigger
                name="settings"
                contentStyle={{ backgroundColor: screenBg }}
            >
                {Platform.select({
                    ios: <NativeTabs.Trigger.Icon sf="gearshape" />,
                    android: (
                        <NativeTabs.Trigger.Icon
                            src={
                                <NativeTabs.Trigger.VectorIcon
                                    family={Ionicons as VectorIconFamily}
                                    name="settings"
                                />
                            }
                            selectedColor={tintColor}
                        />
                    ),
                })}
                <NativeTabs.Trigger.Label selectedStyle={labelSelectedStyle}>
                    {getLabel("settings", lang || "en")}
                </NativeTabs.Trigger.Label>
            </NativeTabs.Trigger>
        </NativeTabs>
    );
}
