import { useEffect } from "react";
import {
    Platform,
    DynamicColorIOS,
    ColorValue,
    ImageSourcePropType,
} from "react-native";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";
import { theme } from "@/theme";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { useThemeColor } from "@/components/Themed";
import { getLabel } from "@/components/Label";
import {
    useSettings,
    useEffectiveColorScheme,
} from "@/contexts/SettingsContext";
import { usePathname, useRouter } from "expo-router";

// Todo (betomoedano): In the future we can remove this type. Learn more: https://exponent-internal.slack.com/archives/C0447EFTS74/p1758042759724779?thread_ts=1758039375.241799&cid=C0447EFTS74
type VectorIconFamily = {
    getImageSource: (
        name: string,
        size: number,
        color: ColorValue,
    ) => Promise<ImageSourcePropType>;
};

export default function TabsLayout() {
    const { lang, historyEnabled } = useSettings();
    const router = useRouter();
    const pathname = usePathname();
    const scheme = useEffectiveColorScheme();
    const screenBg =
        Platform.OS === "ios"
            ? DynamicColorIOS({ light: "#FFFFFF", dark: "#000000" })
            : scheme === "dark"
              ? "#000000"
              : "#FFFFFF";
    const tintColor = useThemeColor(theme.color.text);
    const inactiveTintColor = useThemeColor({
        light: "#00000090",
        dark: "#FFFFFF90",
    });
    const labelSelectedStyle =
        Platform.OS === "ios" ? { color: tintColor } : undefined;

    // If history gets disabled while user is on the history tab, redirect to scan
    useEffect(() => {
        if (!historyEnabled && pathname === "/history") {
            router.replace("/");
        }
    }, [historyEnabled, pathname, router]);

    return (
        <NativeTabs
            // Remount only when history flag changes so Android updates tab triggers, but keep the current tab on language changes
            key={`tabs-${historyEnabled ? "on" : "off"}`}
            backgroundColor={
                Platform.OS === "ios"
                    ? DynamicColorIOS({ light: "#F2F2F7", dark: "#1C1C1E" })
                    : scheme === "dark"
                      ? "#1C1C1E"
                      : "#F2F2F7"
            }
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
            tintColor={
                Platform.OS === "ios"
                    ? DynamicColorIOS(theme.color.reactBlue)
                    : inactiveTintColor
            }
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

            {/* History tab (conditionally visible if history is enabled) */}
            {historyEnabled && (
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
                    <NativeTabs.Trigger.Label
                        selectedStyle={labelSelectedStyle}
                    >
                        {getLabel("history", lang || "en")}
                    </NativeTabs.Trigger.Label>
                </NativeTabs.Trigger>
            )}

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
