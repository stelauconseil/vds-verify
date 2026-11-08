import { Platform } from "react-native";
import { requireNativeModule } from "expo";
import { CameraView, scanFromURLAsync } from "expo-camera";
import { File } from "expo-file-system";

// iOS: VisionKit scanner + Vision (DataMatrix included), see ios/DocumentScanModule.swift.
const ios =
    Platform.OS === "ios"
        ? requireNativeModule<{ scanDocumentAsync(): Promise<string[] | null> }>(
              "DocumentScan",
          )
        : null;

// Android: ML Kit document scanner, then ML Kit barcode scan of each page.
async function scanAndroid(): Promise<string[] | null> {
    if (!CameraView.isDocumentScannerAvailable)
        throw new Error("error_document_scanner_unavailable");
    const scan = await CameraView.scanDocumentAsync();
    if (!scan) return null;
    try {
        const codes: string[] = [];
        for (const page of scan.pages) {
            const found = await scanFromURLAsync(page, ["datamatrix", "qr"]);
            codes.push(...found.map((b) => b.data));
        }
        return codes;
    } finally {
        for (const page of scan.pages) {
            try {
                new File(page).delete();
            } catch {}
        }
    }
}

// Codes found on the scanned pages; null = cancelled.
export async function scanDocumentAsync(): Promise<string[] | null> {
    const codes = await (ios ? ios.scanDocumentAsync() : scanAndroid());
    return codes && [...new Set(codes)];
}
