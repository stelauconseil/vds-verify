import {
    Image,
    StyleSheet,
    View,
    useWindowDimensions,
    type ViewStyle,
} from "react-native";

// Screenshot build only: a SPECIMEN ID card back stands in for the camera feed.
// Geometry of assets/screenshot-demo/card.webp (sources in scripts/screenshots/demo/).
const CARD = { width: 1404, height: 930, qrX: 702, qrY: 337.5, qrSize: 390 };
export default function ScanDemo({ frameBox }: { frameBox: ViewStyle }) {
    // Whole card on screen on phones; capped on tablets so the QR stays inside the 220 pt frame.
    const scale =
        Math.min(useWindowDimensions().width * 0.92, 520) / CARD.width;
    return (
        <>
            <Image
                source={require("../../assets/screenshot-demo/desk.webp")}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
            />
            {/* Same box as the scan frame: its centre is where the QR goes */}
            <View style={[styles.box, frameBox]} pointerEvents="none">
                <View>
                    <Image
                        source={require("../../assets/screenshot-demo/card.webp")}
                        style={{
                            position: "absolute",
                            left: -CARD.qrX * scale,
                            top: -CARD.qrY * scale,
                            width: CARD.width * scale,
                            height: CARD.height * scale,
                            transformOrigin: [
                                CARD.qrX * scale,
                                CARD.qrY * scale,
                                0,
                            ],
                            transform: [{ rotate: "-4deg" }],
                        }}
                    />
                </View>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    box: {
        position: "absolute",
        justifyContent: "center",
        alignItems: "center",
    },
});
