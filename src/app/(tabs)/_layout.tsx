import { useEffect } from "react";
import {
  Platform,
  DynamicColorIOS,
  ColorValue,
  ImageSourcePropType,
} from "react-native";
import {
  NativeTabs,
  Icon,
  VectorIcon,
  Label,
} from "expo-router/unstable-native-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";
import { theme } from "@/theme";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { useThemeColor } from "@/components/Themed";
import { getLabel } from "@/components/Label";
import { useSettings } from "@/contexts/SettingsContext";
import { usePathname, useRouter } from "expo-router";

// Todo (betomoedano): In the future we can remove this type. Learn more: https://exponent-internal.slack.com/archives/C0447EFTS74/p1758042759724779?thread_ts=1758039375.241799&cid=C0447EFTS74
type VectorIconFamily = {
  getImageSource: (
    name: string,
    size: number,
    color: ColorValue
  ) => Promise<ImageSourcePropType>;
};

export default function TabsLayout() {
  const { lang, historyEnabled } = useSettings();
  const router = useRouter();
  const pathname = usePathname();
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
      <NativeTabs.Trigger name="index">
        {Platform.select({
          ios: <Icon sf="qrcode" />,
          android: (
            <Icon
              src={
                <VectorIcon
                  family={Ionicons as VectorIconFamily}
                  name="qr-code-outline"
                />
              }
              selectedColor={tintColor}
            />
          ),
        })}
        <Label>{getLabel("scan", lang || "en")}</Label>
      </NativeTabs.Trigger>

      {/* History tab (conditionally visible if history is enabled) */}
      {historyEnabled && (
        <NativeTabs.Trigger name="history">
          {Platform.select({
            ios: <Icon sf="archivebox" />,
            android: (
              <Icon
                src={
                  <VectorIcon
                    family={Ionicons as VectorIconFamily}
                    name="archive-outline"
                  />
                }
                selectedColor={tintColor}
              />
            ),
          })}
          <Label selectedStyle={labelSelectedStyle}>
            {getLabel("history", lang || "en")}
          </Label>
        </NativeTabs.Trigger>
      )}

      <NativeTabs.Trigger
        name="settings"
        role={isLiquidGlassAvailable() ? "search" : undefined}
      >
        {Platform.select({
          ios: <Icon sf="gearshape" />,
          android: (
            <Icon
              src={
                <VectorIcon
                  family={Ionicons as VectorIconFamily}
                  name="settings"
                />
              }
              selectedColor={tintColor}
            />
          ),
        })}
        <Label>{getLabel("settings", lang || "en")}</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
