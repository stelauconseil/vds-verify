import { Platform } from "react-native";
import { requireNativeModule } from "expo";
import { CameraView, scanFromURLAsync } from "expo-camera";
import { File } from "expo-file-system";
import { getDocumentAsync } from "expo-document-picker";
import { launchImageLibraryAsync } from "expo-image-picker";

// A code's text, plus for a Data Matrix its exact content (base64): the text stops at the
// first 0x00 byte or mangles binary content such as ICAO seals. iOS hands out the codewords
// (decoded by src/datamatrix.ts), Android ML Kit the message bytes themselves.
export type ScannedCode = {
    data?: string;
    dataMatrixCodewords?: string;
    messageBytes?: string;
};

// iOS: VisionKit scanner + Vision (DataMatrix included), see ios/DocumentScanModule.swift.
const ios =
    Platform.OS === "ios"
        ? requireNativeModule<{
              scanDocumentAsync(): Promise<ScannedCode[] | null>;
              detectCodesInFileAsync(uri: string): Promise<ScannedCode[]>;
          }>("DocumentScan")
        : null;

// Android: PDF pages rendered to images, see android/.../DocumentScanModule.kt.
const android =
    Platform.OS === "android"
        ? requireNativeModule<{
              pdfPageCountAsync(uri: string): Promise<number>;
              renderPdfPageAsync(uri: string, index: number): Promise<string>;
          }>("DocumentScan")
        : null;

const SYMBOLOGIES = ["datamatrix", "qr"] as const;

// Same code found twice (several pages, upscaled retry): kept once.
function unique(codes: ScannedCode[]): ScannedCode[] {
    const byKey = new Map(
        codes.map((c) => [c.messageBytes ?? c.dataMatrixCodewords ?? c.data, c]),
    );
    return [...byKey.values()];
}

// A scan result of expo-camera (patched, patches/expo-camera): iOS hands out the Data Matrix
// codewords, Android ML Kit's rawBytes, which for a Data Matrix are the message bytes.
// ponytail: rawBytes only checked on Data Matrix; ML Kit's QR rawBytes may hold the mode headers.
export function toScannedCode(b: {
    data?: string;
    type?: string | number;
    dataMatrixCodewords?: string;
    rawBytes?: string;
}): ScannedCode {
    // scanFromURLAsync reports ML Kit's format number (Barcode.FORMAT_DATA_MATRIX = 16)
    const dataMatrix = b.type === "datamatrix" || b.type === 16;
    return {
        data: b.data,
        dataMatrixCodewords: b.dataMatrixCodewords,
        messageBytes: dataMatrix ? b.rawBytes : undefined,
    };
}

function deleteFile(uri: string) {
    try {
        new File(uri).delete();
    } catch {}
}

// Android: ML Kit document scanner, then ML Kit barcode scan of each page.
async function scanAndroid(): Promise<ScannedCode[] | null> {
    if (!CameraView.isDocumentScannerAvailable)
        throw new Error("error_document_scanner_unavailable");
    const scan = await CameraView.scanDocumentAsync();
    if (!scan) return null;
    try {
        const codes: ScannedCode[] = [];
        for (const page of scan.pages) {
            const found = await scanFromURLAsync(page, [...SYMBOLOGIES]);
            codes.push(...found.map(toScannedCode));
        }
        return codes;
    } finally {
        scan.pages.forEach(deleteFile);
    }
}

// Pages one by one, stopping at the first one that carries a code (usually the first).
async function detectInPdfAndroid(uri: string): Promise<ScannedCode[]> {
    const count = await android!.pdfPageCountAsync(uri);
    for (let index = 0; index < count; index++) {
        const page = await android!.renderPdfPageAsync(uri, index);
        try {
            const found = await scanFromURLAsync(page, [...SYMBOLOGIES]);
            if (found.length) return found.map(toScannedCode);
        } finally {
            deleteFile(page);
        }
    }
    return [];
}

// Codes found in an image or PDF picked from the files; null = cancelled.
export async function importDocumentAsync(): Promise<ScannedCode[] | null> {
    const pick = await getDocumentAsync({
        type: ["image/*", "application/pdf"],
        copyToCacheDirectory: true, // a file:// URI both native sides can open
    });
    if (pick.canceled) return null;
    const { uri, mimeType, name } = pick.assets[0];
    return detectInFile(uri, mimeType === "application/pdf" || /\.pdf$/i.test(name));
}

// Codes found in a photo picked from the library; null = cancelled. The system picker needs no
// photo library permission.
export async function importPhotoAsync(): Promise<ScannedCode[] | null> {
    const pick = await launchImageLibraryAsync({ mediaTypes: ["images"], quality: 1 });
    if (pick.canceled) return null;
    return detectInFile(pick.assets[0].uri, false);
}

// The picked file is a copy in the app cache: deleted once read.
async function detectInFile(uri: string, pdf: boolean): Promise<ScannedCode[]> {
    try {
        const codes = ios
            ? await ios.detectCodesInFileAsync(uri)
            : pdf
              ? await detectInPdfAndroid(uri)
              : (await scanFromURLAsync(uri, [...SYMBOLOGIES])).map(
                    toScannedCode,
                );
        return unique(codes);
    } catch (error: any) {
        // Android wraps the native message ("… rejected. → Caused by: error_file_locked").
        const key = /error_file_\w+/.exec(String(error?.message))?.[0];
        throw new Error(key ?? "error_file_unreadable");
    } finally {
        deleteFile(uri);
    }
}

// Codes found on the scanned pages; null = cancelled.
export async function scanDocumentAsync(): Promise<ScannedCode[] | null> {
    const codes = await (ios ? ios.scanDocumentAsync() : scanAndroid());
    return codes && unique(codes);
}
