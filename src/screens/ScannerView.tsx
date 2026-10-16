import { FC } from "react";
import { StyleSheet, View } from "react-native";
import * as Animatable from "react-native-animatable";
import { useReducedMotion } from "react-native-reanimated";

type Props = { scanned: boolean };

const ScannerView: FC<Props> = ({ scanned }) => {
    // The idle pulse loops forever: keep the frame still when Reduce Motion is on.
    const reduceMotion = useReducedMotion();
    return (
        <Animatable.View
            style={styles.scannerView}
            animation={
                scanned ? "fadeOut" : reduceMotion ? undefined : "pulse"
            }
            iterationCount={scanned ? 1 : "infinite"}
            pointerEvents="none"
        >
            <View style={styles.borderTopLeft} />
            <View style={styles.borderTopRight} />
            <View style={styles.borderBottomLeft} />
            <View style={styles.borderBottomRight} />
        </Animatable.View>
    );
};

const BORDER = {
    position: "absolute" as const,
    borderColor: "#fff",
    width: 55,
    height: 55,
};
const BORDER_WIDTH = 10;
const BORDER_RADIUS = 35;

const styles = StyleSheet.create({
    scannerView: {
        width: 220,
        maxWidth: "100%",
        height: 220,
        maxHeight: "100%",
    },
    borderTopLeft: {
        ...BORDER,
        top: 0,
        left: 0,
        borderTopLeftRadius: BORDER_RADIUS,
        borderTopWidth: BORDER_WIDTH,
        borderLeftWidth: BORDER_WIDTH,
    },
    borderTopRight: {
        ...BORDER,
        top: 0,
        right: 0,
        borderTopRightRadius: BORDER_RADIUS,
        borderTopWidth: BORDER_WIDTH,
        borderRightWidth: BORDER_WIDTH,
    },
    borderBottomLeft: {
        ...BORDER,
        bottom: 0,
        left: 0,
        borderBottomLeftRadius: BORDER_RADIUS,
        borderBottomWidth: BORDER_WIDTH,
        borderLeftWidth: BORDER_WIDTH,
    },
    borderBottomRight: {
        ...BORDER,
        bottom: 0,
        right: 0,
        borderBottomRightRadius: BORDER_RADIUS,
        borderBottomWidth: BORDER_WIDTH,
        borderRightWidth: BORDER_WIDTH,
    },
});

export default ScannerView;
