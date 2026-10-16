import type { ComponentProps } from "react";
import { Text, View, TextStyle, PressableProps, Pressable } from "react-native";
import { useEffectiveColorScheme } from "@/contexts/SettingsContext";
import Animated from "react-native-reanimated";

import { theme } from "@/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ThemeProps = {
    color?: { light: string; dark: string };

    // TODO (Kadi): Remove these props
    lightColor?: string;
    darkColor?: string;
};

export type TextProps = ThemeProps & {
    marginBottom?: number;
    fontSize?: TextStyle["fontSize"];
    fontWeight?: "light" | "medium" | "semiBold" | "bold";
    italic?: boolean;
    animated?: boolean;
} & ComponentProps<typeof Text>;

export type ViewProps = ThemeProps &
    ComponentProps<typeof View> & { animated?: boolean };

export function useThemeColor<T, U>(props: { light: T; dark: U }) {
    const theme = useEffectiveColorScheme();
    return props[theme];
}

export function ThemedText(props: TextProps) {
    const {
        style,
        lightColor,
        darkColor,
        marginBottom = 0,
        fontSize = theme.fontSize16,
        fontWeight,
        italic,
        animated,
        color: themeColor,
        ...otherProps
    } = props;

    const color = useThemeColor(themeColor ?? theme.color.text);

    // System font (Montserrat was never bundled): weights map onto SF / Roboto.
    const font: TextStyle = {
        fontWeight:
            fontWeight === "light"
                ? "300"
                : fontWeight === "semiBold"
                  ? "600"
                  : fontWeight === "bold"
                    ? "700"
                    : "500",
        fontStyle: italic ? "italic" : "normal",
    };

    if (animated) {
        return (
            <Animated.Text
                style={[{ color, marginBottom, fontSize, ...font }, style]}
                {...otherProps}
            />
        );
    }

    return (
        <Text
            style={[{ color, marginBottom, fontSize, ...font }, style]}
            {...otherProps}
        />
    );
}

export function ThemedView(props: ViewProps) {
    const { style, animated, ...otherProps } = props;
    const backgroundColor = useThemeColor(
        props.color ?? theme.color.background,
    );

    if (animated) {
        return (
            <Animated.View
                style={[{ backgroundColor }, style]}
                {...otherProps}
            />
        );
    }

    return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}

export function ThemedPressable(
    props: PressableProps & {
        backgroundColor?: { light: string; dark: string };
        animated?: boolean;
    },
) {
    const { style, animated, ...otherProps } = props;
    const backgroundColor = useThemeColor(
        props.backgroundColor ?? theme.color.background,
    );

    if (animated) {
        return (
            <AnimatedPressable
                style={[
                    { backgroundColor },
                    typeof style === "function"
                        ? style({ pressed: false })
                        : style,
                ]}
                {...otherProps}
            />
        );
    }

    return (
        <Pressable
            style={[
                { backgroundColor },
                typeof style === "function" ? style({ pressed: false }) : style,
            ]}
            {...otherProps}
        />
    );
}
