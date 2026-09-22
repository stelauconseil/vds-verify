import { useState, useEffect, useCallback, useRef } from "react";
import {
    AppState,
    View,
    StyleSheet,
    Text,
    Pressable,
    type GestureResponderEvent,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter, useLocalSearchParams, usePathname } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import { Buffer } from "buffer";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import { useSettings } from "@/contexts/SettingsContext";
import ScannerView from "@/screens/ScannerView";
import { useScanStatus } from "@/contexts/ScanStatusContext";
import { getLabel } from "@/components/Label";
import { normalizeVdsResult, type VdsResult } from "@/types/vds";

export default function ScanRoute() {
    const router = useRouter();
    const pathname = usePathname();
    const params = useLocalSearchParams();
    const { lang } = useSettings();
    const isFocused = pathname === "/" || pathname === "/index";
    const [appState, setAppState] = useState(AppState.currentState);
    const appStateRef = useRef(AppState.currentState);
    const cameraReadyRef = useRef(false);
    const decodedRef = useRef(false);
    const [result, setResult] = useState<VdsResult | null>(null);
    const [scanned, setScanned] = useState<boolean>(false);
    const [zoomLevel, setZoomLevel] = useState<number>(0.1);
    const [torchEnabled, setTorchEnabled] = useState<boolean>(false);
    const [permission, requestPermission, getCameraPermission] =
        useCameraPermissions();
    const cameraRef = useRef<CameraView | null>(null);
    const insets = useSafeAreaInsets();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    // Modal state unused after switching to sheet-based VDS
    const [url, setUrl] = useState<string | null>(null);
    const {
        setStatus,
        setResult: setContextResult,
        result: contextResult,
    } = useScanStatus();
    // Prevent double navigation / double processing
    const presentedRef = useRef(false);
    const processingRef = useRef(false);
    const pinchStartDistanceRef = useRef<number | null>(null);
    const pinchStartZoomRef = useRef<number>(0.1);

    useEffect(() => {
        const subscription = AppState.addEventListener(
            "change",
            (nextState) => {
                appStateRef.current = nextState;
                setAppState(nextState);
                if (nextState !== "active") {
                    cameraReadyRef.current = false;
                    setTorchEnabled(false);
                    pinchStartDistanceRef.current = null;
                } else {
                    void getCameraPermission().catch(() =>
                        setErrorMessage("cameraerror"),
                    );
                }
            },
        );
        return () => {
            subscription.remove();
            if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
        };
    }, [getCameraPermission]);

    const cameraActive =
        isFocused && appState === "active" && !!permission?.granted;
    useEffect(() => {
        if (!cameraActive) {
            cameraReadyRef.current = false;
            setTorchEnabled(false);
            pinchStartDistanceRef.current = null;
        }
    }, [cameraActive]);

    const clampZoom = (value: number): number => {
        return Math.max(0, Math.min(1, value));
    };

    const getTouchDistance = (event: GestureResponderEvent): number | null => {
        const touches = event.nativeEvent.touches;
        if (!touches || touches.length < 2) return null;
        const [first, second] = touches;
        const dx = first.pageX - second.pageX;
        const dy = first.pageY - second.pageY;
        return Math.sqrt(dx * dx + dy * dy);
    };

    const handleTouchStart = (event: GestureResponderEvent) => {
        const distance = getTouchDistance(event);
        if (distance === null) return;
        pinchStartDistanceRef.current = distance;
        pinchStartZoomRef.current = zoomLevel;
    };

    const handleTouchMove = (event: GestureResponderEvent) => {
        const distance = getTouchDistance(event);
        if (distance === null || pinchStartDistanceRef.current === null) {
            return;
        }
        const scale = distance / pinchStartDistanceRef.current;
        const sensitivity = 0.7;
        const nextZoom = clampZoom(
            pinchStartZoomRef.current + (scale - 1) * sensitivity,
        );
        setZoomLevel(nextZoom);
    };

    const handleTouchEnd = () => {
        pinchStartDistanceRef.current = null;
        pinchStartZoomRef.current = zoomLevel;
    };

    const parseData = useCallback((data: string): string | null => {
        if (data?.startsWith("http")) {
            const lastIndex = data.lastIndexOf("/vds#");
            if (lastIndex === -1 || lastIndex === data.length - 1) return null;
            return Buffer.from(data.substring(lastIndex + 5)).toString(
                "base64",
            );
        } else if (data.startsWith("vds")) {
            return Buffer.from(data.substring(6)).toString("base64");
        } else {
            return Buffer.from(data).toString("base64");
        }
    }, []);

    const normalizeErrorMessage = useCallback(
        (message?: string | null): string => {
            if (!message) return "error";
            if (
                message === "Une erreur est survenue lors du décodage" ||
                message === "Unknown QR code format or error during decoding" ||
                message === "error_invalid_qr"
            ) {
                return "error_invalid_qr";
            }
            return message;
        },
        [],
    );

    const showError = useCallback(
        (message?: string | null) => {
            const normalized = normalizeErrorMessage(message);
            const localized = getLabel(normalized, lang) || normalized;
            setErrorMessage(localized);
            if (errorTimerRef.current) {
                clearTimeout(errorTimerRef.current);
            }
            errorTimerRef.current = setTimeout(
                () => setErrorMessage(null),
                3000,
            );
        },
        [lang, normalizeErrorMessage],
    );

    const processResult = useCallback(
        async ({ data }: { data: string }) => {
            if (processingRef.current || decodedRef.current) return;
            processingRef.current = true;
            try {
                const apiUrl = process.env.EXPO_PUBLIC_VDS_API_URL as string;
                setScanned(true);
                const b64encodedvds = parseData(data);
                if (b64encodedvds === null) {
                    showError("error_invalid_qr");
                    return;
                }
                try {
                    const response = await fetch(`${apiUrl}/api/v1/decode`, {
                        method: "POST",
                        headers: {
                            Accept: "application/json",
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ vds: b64encodedvds }),
                    });
                    const { success, message, vds } = await response.json();
                    if (success === true) {
                        const normalized = normalizeVdsResult(vds);
                        if (!normalized) {
                            showError("error_invalid_qr");
                            return;
                        }
                        try {
                            await Haptics.impactAsync(
                                Haptics.ImpactFeedbackStyle.Light,
                            );
                        } catch {
                            // Ignore haptics errors (e.g., unsupported device)
                        }
                        const historyEnabled =
                            (await AsyncStorage.getItem("historyEnabled")) !==
                            "false";
                        if (historyEnabled) {
                            const history = JSON.parse(
                                (await AsyncStorage.getItem("scanHistory")) ||
                                    "[]",
                            );
                            const newEntry = {
                                timestamp: new Date().toISOString(),
                                data: normalized,
                                pinned: false,
                            };
                            history.unshift(newEntry);
                            await AsyncStorage.setItem(
                                "scanHistory",
                                JSON.stringify(history),
                            );
                        }
                        decodedRef.current = true;
                        setResult(normalized);
                    } else {
                        showError(message);
                    }
                } catch (error: any) {
                    showError(error?.message ?? "error");
                }
            } finally {
                processingRef.current = false;
            }
        },
        [parseData, showError],
    );

    useEffect(() => {
        const getCameraPermission = async () => {
            try {
                const { status } = await requestPermission();
                if (status !== "granted") {
                    setErrorMessage("cameraerror");
                }
            } catch {
                setErrorMessage("cameraerror");
            }
        };
        getCameraPermission();
    }, [requestPermission]);

    useEffect(() => {
        Linking.getInitialURL().then((u) => setUrl(u as string | null));
    }, []);

    useEffect(() => {
        const subscription: any = Linking.addEventListener(
            "url",
            (event: { url: string }) => {
                setUrl(event.url);
            },
        );
        return () => subscription.remove();
    }, []);

    // Update scan status based on local result and present sheet once
    useEffect(() => {
        if (result && scanned && appState === "active" && isFocused) {
            setContextResult(result);
            if (result.sign_is_valid && result.signer) {
                setStatus("valid");
            } else if (result.signer) {
                setStatus("invalid");
            } else {
                setStatus("unsigned");
            }
            if (!presentedRef.current) {
                presentedRef.current = true;
                router.push("/result");
            }
        } else if (!result) {
            setStatus(null);
            setContextResult(null);
            presentedRef.current = false;
        }
    }, [
        result,
        scanned,
        setStatus,
        setContextResult,
        router,
        pathname,
        appState,
        isFocused,
    ]);

    // When context result is cleared (e.g., user closes the result sheet), remount camera
    useEffect(() => {
        if (!contextResult) {
            decodedRef.current = false;
            setScanned(false);
            setResult(null);
            setTorchEnabled(false);
            presentedRef.current = false;
        }
    }, [contextResult]);

    useEffect(() => {
        if (
            url !== null &&
            typeof url === "string" &&
            (url.startsWith("http") || url.startsWith("vds"))
        ) {
            processResult({ data: url });
            setUrl(null);
        }
    }, [processResult, url]);

    // Remove auto-clear on pathname to avoid instant closing of the result sheet

    // Handle deep link result from history
    useEffect(() => {
        if (params.result && typeof params.result === "string") {
            try {
                const parsedResult = JSON.parse(params.result as string);
                const normalized = normalizeVdsResult(parsedResult);
                if (normalized) {
                    setResult(normalized);
                    setScanned(true);
                }
                // Clear the param so the camera route no longer treats this as an active result
                router.setParams({ result: undefined });
            } catch {
                // Invalid result param
            }
        }
    }, [params.result, router]);

    return (
        <View style={styles.container}>
            <View style={{ flex: 1 }}>
                {/* Keep the live preview through decoding; navigation releases the camera. */}
                {cameraActive ? (
                    <>
                        <CameraView
                            ref={cameraRef}
                            zoom={zoomLevel}
                            enableTorch={torchEnabled}
                            barcodeScannerSettings={{
                                barcodeTypes: ["qr", "datamatrix"],
                            }}
                            onCameraReady={() => {
                                cameraReadyRef.current = true;
                            }}
                            onMountError={() => {
                                cameraReadyRef.current = false;
                                showError("cameraerror");
                            }}
                            onBarcodeScanned={(event) => {
                                if (
                                    appStateRef.current === "active" &&
                                    cameraReadyRef.current &&
                                    isFocused
                                ) {
                                    void processResult(event);
                                }
                            }}
                            style={StyleSheet.absoluteFill}
                        />
                        <View
                            style={StyleSheet.absoluteFill}
                            onStartShouldSetResponder={(event) =>
                                event.nativeEvent.touches?.length === 2
                            }
                            onMoveShouldSetResponder={(event) =>
                                event.nativeEvent.touches?.length >= 2
                            }
                            onStartShouldSetResponderCapture={(event) =>
                                event.nativeEvent.touches?.length === 2
                            }
                            onMoveShouldSetResponderCapture={(event) =>
                                event.nativeEvent.touches?.length >= 2
                            }
                            onResponderStart={handleTouchStart}
                            onResponderMove={handleTouchMove}
                            onResponderRelease={handleTouchEnd}
                            onResponderTerminate={handleTouchEnd}
                        />
                        <View
                            style={[
                                styles.zoomBadge,
                                {
                                    top: Math.max(insets.top, 8) + 8,
                                    right: insets.right + 12,
                                },
                            ]}
                        >
                            <Text style={styles.zoomBadgeText}>
                                Zoom {Math.round(zoomLevel * 100)}%
                            </Text>
                        </View>
                        <Pressable
                            onPress={() => setTorchEnabled((v) => !v)}
                            style={[
                                styles.torchButton,
                                {
                                    top: Math.max(insets.top, 8) + 8,
                                    left: insets.left + 12,
                                },
                                torchEnabled && styles.torchButtonActive,
                            ]}
                            accessibilityLabel="Toggle flashlight"
                            accessibilityRole="button"
                        >
                            <Ionicons
                                name={torchEnabled ? "flash" : "flash-outline"}
                                size={20}
                                color="#fff"
                            />
                        </Pressable>
                        <View
                            style={[
                                styles.helpTextWrapper,
                                {
                                    bottom: Math.max(insets.bottom, 8) + 40,
                                    left: insets.left,
                                    right: insets.right,
                                },
                            ]}
                        >
                            <Text style={styles.helpText}>
                                {getLabel("helpscan", lang)}
                            </Text>
                        </View>
                        <View
                            pointerEvents="none"
                            style={[
                                styles.content,
                                {
                                    top: insets.top + 56,
                                    bottom: insets.bottom + 112,
                                    left: insets.left + 16,
                                    right: insets.right + 16,
                                },
                            ]}
                        >
                            <ScannerView scanned={!!result} />
                        </View>
                    </>
                ) : null}
            </View>
            {isFocused && permission && !permission.granted && (
                <View
                    style={[
                        styles.permissionPanel,
                        {
                            paddingTop: insets.top + 24,
                            paddingBottom: insets.bottom + 24,
                            paddingLeft: insets.left + 24,
                            paddingRight: insets.right + 24,
                        },
                    ]}
                >
                    <Text style={styles.helpText}>
                        {getLabel("cameraerror", lang)}
                    </Text>
                    <Pressable
                        accessibilityRole="button"
                        testID="camera-permission"
                        style={styles.permissionButton}
                        onPress={() => {
                            if (permission.canAskAgain)
                                void requestPermission();
                            else void Linking.openSettings();
                        }}
                    >
                        <Text style={styles.helpText}>
                            {getLabel(
                                permission.canAskAgain
                                    ? "camerapermission"
                                    : "settings",
                                lang,
                            )}
                        </Text>
                    </Pressable>
                </View>
            )}
            {/* Transient error message toast above camera */}
            {!!errorMessage && (
                <View
                    style={[
                        styles.errorToast,
                        {
                            top: insets.top + 12,
                            left: insets.left + 16,
                            right: insets.right + 16,
                        },
                    ]}
                >
                    <Text style={styles.errorToastTitle}>
                        {getLabel("error", lang)}
                    </Text>
                    <Text style={styles.errorToastText}>
                        {getLabel(errorMessage, lang) || errorMessage}
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    permissionPanel: {
        ...StyleSheet.absoluteFill,
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
    },
    permissionButton: {
        minHeight: 48,
        padding: 12,
        borderRadius: 12,
        backgroundColor: "#0069b4",
    },
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    content: {
        ...StyleSheet.absoluteFill,
        justifyContent: "center",
        alignItems: "center",
    },
    helpTextWrapper: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 15,
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.6)",
    },
    helpText: {
        color: "#ffffff",
    },
    errorToast: {
        position: "absolute",
        left: 16,
        right: 16,
        borderRadius: 12,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: "rgba(239,68,68,0.9)",
    },
    errorToastTitle: {
        color: "#fff",
        fontWeight: "700",
        marginBottom: 2,
        fontSize: 14,
        textAlign: "center",
    },
    errorToastText: {
        color: "#fff",
        fontSize: 13,
        textAlign: "center",
    },
    zoomBadge: {
        position: "absolute",
        right: 12,
        borderRadius: 10,
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: "rgba(0,0,0,0.55)",
    },
    zoomBadgeText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
    },
    torchButton: {
        position: "absolute",
        left: 12,
        borderRadius: 10,
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: "rgba(0,0,0,0.55)",
    },
    torchButtonActive: {
        backgroundColor: "rgba(255,200,0,0.75)",
    },
});
