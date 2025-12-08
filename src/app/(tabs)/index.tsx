import { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Text, Image } from "react-native";
import { captureRef } from "react-native-view-shot";
import { useRouter, useLocalSearchParams, usePathname } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import { Buffer } from "buffer";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useIsFocused } from "@react-navigation/native";

import { useSettings } from "@/contexts/SettingsContext";
import ScannerView from "@/screens/ScannerView";
import { useScanStatus } from "@/contexts/ScanStatusContext";
import { getLabel } from "@/components/Label";
import type { VdsResult } from "@/types/vds";

export default function ScanRoute() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useLocalSearchParams();
  const { lang } = useSettings();
  const isFocused = useIsFocused();
  const [result, setResult] = useState<VdsResult | null>(null);
  const [scanned, setScanned] = useState<boolean>(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);
  const cameraContainerRef = useRef<View | null>(null);
  const insets = useSafeAreaInsets();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const { status } = await requestPermission();
        if (status !== "granted") {
          setErrorMessage("error_camera_permission");
        }
      } catch {
        setErrorMessage("error_camera_permission");
      }
    };
    getCameraPermission();
    return () => {
      if (cameraRef.current?.stopAsync) {
        cameraRef.current.stopAsync();
      }
    };
  }, [requestPermission]);

  useEffect(() => {
    Linking.getInitialURL().then((u) => setUrl(u as string | null));
  }, []);

  useEffect(() => {
    const subscription: any = Linking.addEventListener(
      "url",
      (event: { url: string }) => {
        setUrl(event.url);
      }
    );
    return () => subscription.remove();
  }, []);

  // Update scan status based on local result and present sheet once
  useEffect(() => {
    if (result && scanned) {
      setContextResult(result);
      if (result.sign_is_valid && result.signer) {
        setStatus("valid");
      } else if (result.signer) {
        setStatus("invalid");
      } else {
        setStatus("unsigned");
      }
      if (!presentedRef.current && pathname !== "/result") {
        presentedRef.current = true;
        router.push("/result");
      }
    } else if (!result) {
      setStatus(null);
      setContextResult(null);
      presentedRef.current = false;
    }
  }, [result, scanned, setStatus, setContextResult, router, pathname]);

  // When context result is cleared (e.g., user closes the result sheet), remount camera
  useEffect(() => {
    if (!contextResult) {
      setScanned(false);
      setPreviewUri(null);
      setResult(null);
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
  }, [url]);

  // Remove auto-clear on pathname to avoid instant closing of the result sheet

  // Handle deep link result from history
  useEffect(() => {
    if (params.result && typeof params.result === "string") {
      try {
        const parsedResult = JSON.parse(params.result as string);
        setResult(parsedResult);
        setScanned(true);
        // Clear the param so the camera route no longer treats this as an active result
        router.setParams({ result: undefined });
      } catch {
        // Invalid result param
      }
    }
  }, [params.result, router]);

  const parseData = (data: string): string | null => {
    if (data?.startsWith("http")) {
      const lastIndex = data.lastIndexOf("/vds#");
      if (lastIndex === -1 || lastIndex === data.length - 1) return null;
      return Buffer.from(data.substring(lastIndex + 5)).toString("base64");
    } else if (data.startsWith("vds")) {
      return Buffer.from(data.substring(6)).toString("base64");
    } else {
      return Buffer.from(data).toString("base64");
    }
  };

  const processResult = async ({ data }: { data: string }) => {
    if (processingRef.current) return; // guard against rapid duplicate scans
    processingRef.current = true;
    const apiUrl = process.env.EXPO_PUBLIC_VDS_API_URL as string;
    // Try to capture a preview frame before unmounting the camera
    try {
      if (!previewUri) {
        // Prefer a view snapshot for reliability across CameraView versions
        try {
          const snapUri = await captureRef(
            cameraRef.current ?? cameraContainerRef,
            {
              format: "jpg",
              quality: 0.8,
              result: "tmpfile",
            }
          );
          if (snapUri) setPreviewUri(snapUri as string);
        } catch {
          // Fallback to camera capture if available
          if (cameraRef.current?.takePictureAsync) {
            const photo = await cameraRef.current.takePictureAsync({
              quality: 0.8,
              skipProcessing: true,
            });
            if (photo?.uri) setPreviewUri(photo.uri);
          }
        }
      }
    } catch {
      // Ignore capture errors, continue processing
    }
    // Unmount camera on next render
    setScanned(true);
    const b64encodedvds = parseData(data);
    if (b64encodedvds === null) {
      setErrorMessage("error_invalid_qr");
      setTimeout(() => setErrorMessage(null), 3000);
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
        // Light haptic feedback on successful scan
        try {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch {
          // Ignore haptics errors (e.g., unsupported device)
        }
        const historyEnabled =
          (await AsyncStorage.getItem("historyEnabled")) !== "false";
        if (historyEnabled) {
          const history = JSON.parse(
            (await AsyncStorage.getItem("scanHistory")) || "[]"
          );
          const newEntry = { timestamp: new Date().toISOString(), data: vds };
          history.unshift(newEntry);
          await AsyncStorage.setItem("scanHistory", JSON.stringify(history));
        }
        setResult(vds as VdsResult);
      } else {
        setErrorMessage(message);
        setTimeout(() => setErrorMessage(null), 3000);
      }
    } catch (error: any) {
      setErrorMessage(error.message);
      setTimeout(() => setErrorMessage(null), 3000);
    }
    processingRef.current = false;
  };

  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }} ref={cameraContainerRef}>
        {/* Mount camera only while no decoded result exists */}
        {!result && isFocused ? (
          <>
            <CameraView
              ref={cameraRef}
              zoom={0.15}
              barcodeScannerSettings={{
                barcodeTypes: ["qr", "datamatrix", "aztec"],
              }}
              onBarcodeScanned={
                result || !isFocused ? undefined : (processResult as any)
              }
              style={StyleSheet.absoluteFillObject}
            />
            <View
              style={[
                styles.helpTextWrapper,
                { bottom: Math.max(insets.bottom, 8) + 8 + 70 },
              ]}
            >
              <Text style={styles.helpText}>{getLabel("helpscan", lang)}</Text>
            </View>
            <View style={styles.content}>
              <ScannerView scanned={!!result} />
            </View>
          </>
        ) : (
          previewUri && (
            <Image
              source={{ uri: previewUri }}
              style={StyleSheet.absoluteFillObject}
              resizeMode="cover"
              accessible
              accessibilityLabel="Scan preview"
            />
          )
        )}
      </View>
      {/* Transient error message toast above camera */}
      {!!errorMessage && (
        <View style={[styles.errorToast, { top: insets.top + 12 }]}>
          <Text style={styles.errorToastTitle}>{getLabel("error", lang)}</Text>
          <Text style={styles.errorToastText}>
            {getLabel(errorMessage, lang) || errorMessage}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  content: {
    ...StyleSheet.absoluteFillObject,
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
});
