// Proves to the API that requests come from the genuine app (see APP_INTEGRITY_PLAN.md).
// Any failure to build a proof falls back to an unsigned request: the server decides.
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as AppIntegrity from "@expo/app-integrity";
import * as Crypto from "expo-crypto";
import * as Application from "expo-application";

const KEY_ID = "appAttestKeyId";
const PENDING_KEY_ID = "appAttestPendingKeyId";
const JSON_HEADERS = {
    Accept: "application/json",
    "Content-Type": "application/json",
};
const projectNumber = process.env.EXPO_PUBLIC_GCP_PROJECT_NUMBER;

const errorCode = (e: unknown) => (e as { code?: string } | null)?.code;

let provider: Promise<void> | null = null;
function prepareProvider() {
    provider ??= AppIntegrity.prepareIntegrityTokenProviderAsync(
        projectNumber!,
    ).catch((e) => {
        provider = null;
        throw e;
    });
    return provider;
}
// Warm up the Play Integrity provider at launch so the first scan is fast.
if (Platform.OS === "android" && projectNumber) prepareProvider().catch(() => {});

async function registerIosKey(apiUrl: string): Promise<string> {
    // Challenge first: no Secure Enclave key is created if the server can't register it.
    const res = await fetch(`${apiUrl}/api/v1/integrity/challenge`, {
        method: "POST",
        headers: JSON_HEADERS,
    });
    if (!res.ok) throw new Error(`integrity challenge: HTTP ${res.status}`);
    const { challenge } = await res.json();

    // Apple: on SERVER_UNAVAILABLE retry later with the same key, otherwise discard it.
    const keyId =
        (await AsyncStorage.getItem(PENDING_KEY_ID)) ??
        (await AppIntegrity.generateKeyAsync());
    await AsyncStorage.setItem(PENDING_KEY_ID, keyId);
    let attestation: string;
    try {
        attestation = await AppIntegrity.attestKeyAsync(keyId, challenge);
    } catch (e) {
        if (errorCode(e) !== "ERR_APP_INTEGRITY_SERVER_UNAVAILABLE") {
            await AsyncStorage.removeItem(PENDING_KEY_ID);
        }
        throw e;
    }

    const reg = await fetch(`${apiUrl}/api/v1/integrity/ios/attest`, {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({ keyId, attestation, challenge }),
    });
    if (!reg.ok) {
        if (reg.status < 500) await AsyncStorage.removeItem(PENDING_KEY_ID);
        throw new Error(`integrity attest: HTTP ${reg.status}`);
    }
    await AsyncStorage.setItem(KEY_ID, keyId);
    await AsyncStorage.removeItem(PENDING_KEY_ID);
    return keyId;
}

async function proofHeaders(
    apiUrl: string,
    body: string,
): Promise<Record<string, string>> {
    const ts = Date.now().toString();
    const nonce = Crypto.randomUUID();
    const binding = `${ts}.${nonce}.${body}`;
    const common = {
        "X-Integrity-Platform": Platform.OS,
        "X-Integrity-Timestamp": ts,
        "X-Integrity-Nonce": nonce,
    };

    if (Platform.OS === "ios") {
        if (!AppIntegrity.isSupported) return {};
        const keyId =
            (await AsyncStorage.getItem(KEY_ID)) ??
            (await registerIosKey(apiUrl));
        try {
            // Native side signs SHA256(utf8(binding)).
            const assertion = await AppIntegrity.generateAssertionAsync(
                keyId,
                binding,
            );
            return {
                ...common,
                "X-Integrity-Key-Id": keyId,
                "X-Integrity-Assertion": assertion,
            };
        } catch (e) {
            if (errorCode(e) === "ERR_APP_INTEGRITY_INVALID_KEY") {
                await AsyncStorage.removeItem(KEY_ID);
            }
            throw e;
        }
    }

    if (Platform.OS === "android" && projectNumber) {
        const requestHash = await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256,
            binding,
        );
        let token: string;
        try {
            await prepareProvider();
            token = await AppIntegrity.requestIntegrityCheckAsync(requestHash);
        } catch (e) {
            if (errorCode(e) !== "ERR_APP_INTEGRITY_PROVIDER_INVALID") throw e;
            provider = null;
            await prepareProvider();
            token = await AppIntegrity.requestIntegrityCheckAsync(requestHash);
        }
        return { ...common, "X-Integrity-Token": token };
    }

    return {};
}

/** POST `body` (exact JSON string) to the API with an integrity proof attached. */
export async function integrityFetch(
    apiUrl: string,
    path: string,
    body: string,
): Promise<Response> {
    const send = async () => {
        let proof: Record<string, string> = {};
        try {
            proof = await proofHeaders(apiUrl, body);
        } catch (e) {
            if (__DEV__) console.warn("App integrity proof unavailable", e);
        }
        return fetch(`${apiUrl}${path}`, {
            method: "POST",
            headers: {
                ...JSON_HEADERS,
                ...(Application.nativeApplicationVersion && {
                    "X-App-Version": Application.nativeApplicationVersion,
                }),
                ...proof,
            },
            body,
        });
    };

    const res = await send();
    if (Platform.OS === "ios" && res.status === 401) {
        const { message } = await res
            .clone()
            .json()
            .catch(() => ({}));
        if (message === "error_integrity_key") {
            // Server forgot or revoked our key: register a new one, retry once.
            await AsyncStorage.removeItem(KEY_ID);
            return send();
        }
    }
    return res;
}
