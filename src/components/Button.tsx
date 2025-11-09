import { type ReactNode } from "react";
import { Platform, StyleProp, ViewStyle, View } from "react-native";
import Constants from "expo-constants";
import {
  Button as RNEButton,
  ButtonProps as RNEButtonProps,
} from "@rneui/themed";

// Attempt to import Expo UI SwiftUI components lazily to avoid crashes if not available.
let SwiftHost: any = null;
let SwiftButton: any = null;
try {
  // These imports will be available when @expo/ui is installed and the app runs in a dev build/standalone on iOS.
  // We keep them inside try/catch to avoid bundling issues if not supported in the current runtime (e.g., Expo Go).
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const swift = require("@expo/ui/swift-ui");
  SwiftHost = swift.Host;
  SwiftButton = swift.Button;
} catch (e) {
  // noop, fall back to RNE components
}

export type ButtonProps = Omit<RNEButtonProps, "title"> & {
  title: string;
  hostStyle?: StyleProp<ViewStyle>;
  variant?: "primary" | "outline" | "danger" | "neutral";
  rightIcon?: ReactNode;
};

export function Button(props: ButtonProps) {
  const {
    title,
    onPress,
    hostStyle,
    icon,
    iconRight,
    variant = "primary",
    rightIcon,
    ...rest
  } = props;

  const isExpoGo = Constants.appOwnership === "expo";
  const canUseSwiftUI =
    Platform.OS === "ios" && !isExpoGo && SwiftHost && SwiftButton;

  const baseStyle: any = {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 20,
  };

  const variantStyles: Record<string, any> = {
    primary: {
      backgroundColor: "#0069b4",
      borderColor: "#0069b4",
      borderWidth: 3,
    },
    outline: {
      backgroundColor: "transparent",
      borderColor: "#0069b4",
      borderWidth: 3,
    },
    danger: {
      backgroundColor: "#ff95a1",
      borderColor: "#ff95a1",
      borderWidth: 3,
    },
    neutral: {
      backgroundColor: "#e0e0e0",
      borderColor: "#e0e0e0",
      borderWidth: 3,
    },
  };

  const titleStyle: any = {
    fontSize: 16,
  };
  if (variant === "outline") {
    titleStyle.color = "#0069b4";
  } else if (variant === "danger") {
    titleStyle.color = "#b4001e";
  } else if (variant === "neutral") {
    titleStyle.color = "#333";
  } else {
    titleStyle.color = "white";
  }

  const {
    containerStyle,
    buttonStyle: userButtonStyle,
    titleStyle: userTitleStyle,
    ...rneRest
  } = rest as any;

  if (canUseSwiftUI) {
    return (
      <View
        style={
          [
            { position: "relative", alignSelf: "stretch" },
            containerStyle,
          ] as any
        }
      >
        <SwiftHost matchContents style={hostStyle as any}>
          <SwiftButton onPress={onPress}>{title}</SwiftButton>
        </SwiftHost>
        {rightIcon ? (
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: [{ translateY: -10 }],
            }}
          >
            {rightIcon}
          </View>
        ) : null}
      </View>
    );
  }

  // If a custom rightIcon is provided, render it absolutely so the title can remain visually centered.
  if (rightIcon) {
    return (
      <View
        style={
          [
            { position: "relative", alignSelf: "stretch" },
            containerStyle,
          ] as any
        }
      >
        <RNEButton
          onPress={onPress}
          title={title}
          buttonStyle={[baseStyle, variantStyles[variant], userButtonStyle]}
          titleStyle={{
            ...titleStyle,
            textAlign: "center",
            ...(userTitleStyle || {}),
          }}
          containerStyle={undefined}
          {...rneRest}
        />
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: [{ translateY: -10 }],
          }}
        >
          {rightIcon}
        </View>
      </View>
    );
  }

  return (
    <RNEButton
      onPress={onPress}
      title={title}
      icon={icon as any}
      iconRight={iconRight}
      buttonStyle={[baseStyle, variantStyles[variant], userButtonStyle]}
      titleStyle={{ ...titleStyle, ...(userTitleStyle || {}) }}
      {...(rest as any)}
    />
  );
}

export default {
  Button,
};
