import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Constants from "expo-constants";
import * as Device from "expo-device";
import { Platform } from "react-native";
import CryptoJS from "crypto-js";

const AUTH_TOKEN_STORAGE_KEY = "vds_app_auth_token";
const AUTH_EXPIRES_AT_STORAGE_KEY = "vds_app_auth_expires_at";
const AUTH_DEVICE_KEY_STORAGE_KEY = "vds_app_auth_device_key";
const AUTH_KEY_ID_STORAGE_KEY = "vds_app_auth_key_id";

export type AppAuthorizationSession = {
    token: string;
    expiresAt: number;
};

export type AppIdentity = {
    platform: "ios" | "android" | "web" | "windows" | "macos";
    appId: string;
    packageName: string;
    version: string;
    buildNumber: string;
    deviceModel: string;
    osVersion: string;
    deviceId: string;
};

export type AppAuthorizationRequest = {
    nonce: string;
    platform: string;
    appId: string;
    packageName: string;
    version: string;
    buildNumber: string;
    deviceModel?: string;
    osVersion?: string;
    deviceId?: string;
    keyId: string;
    proof: string;
};

export async function getAppIdentity(): Promise<AppIdentity> {
    const expoConfig = ((Constants as any).expoConfig ?? {}) as Record<
        string,
        any
    >;
    const iosConfig = expoConfig.ios ?? {};
    const androidConfig = expoConfig.android ?? {};

    const appIdentifier =
        Platform.OS === "ios"
            ? (iosConfig.bundleIdentifier ?? "com.stelau.vdsverify")
            : (androidConfig.package ?? "com.stelau.vdsverify");

    return {
        platform: Platform.OS,
        appId: appIdentifier,
        packageName: appIdentifier,
        version: expoConfig.version ?? "0.0.0",
        buildNumber: String(
            Platform.OS === "ios"
                ? (iosConfig.buildNumber ?? "0")
                : (androidConfig.versionCode ?? "0"),
        ),
        deviceModel: Device.modelName ?? Device.modelId ?? "unknown",
        osVersion: Device.osVersion ?? "unknown",
        deviceId: Device.deviceName ?? "unknown",
    };
}

async function getOrCreateDeviceKey(): Promise<string> {
    const existingKey = await AsyncStorage.getItem(AUTH_DEVICE_KEY_STORAGE_KEY);
    if (existingKey) {
        return existingKey;
    }

    const generatedKey = CryptoJS.lib.WordArray.random(32).toString();
    await AsyncStorage.setItem(AUTH_DEVICE_KEY_STORAGE_KEY, generatedKey);
    return generatedKey;
}

async function getOrCreateKeyId(): Promise<string> {
    const existingKeyId = await AsyncStorage.getItem(AUTH_KEY_ID_STORAGE_KEY);
    if (existingKeyId) {
        return existingKeyId;
    }

    const keyId = `vds-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    await AsyncStorage.setItem(AUTH_KEY_ID_STORAGE_KEY, keyId);
    return keyId;
}

function buildClientProof(
    nonce: string,
    deviceKey: string,
    identity: AppIdentity,
) {
    const payload = [
        nonce,
        identity.platform,
        identity.appId,
        identity.packageName,
        identity.version,
        identity.buildNumber,
    ].join("|");

    return CryptoJS.HmacSHA256(payload, deviceKey).toString();
}

async function requestAttestationChallenge(): Promise<string> {
    const apiUrl = (process.env.EXPO_PUBLIC_VDS_API_URL ?? "").replace(
        /\/$/,
        "",
    );
    if (!apiUrl) {
        throw new Error("EXPO_PUBLIC_VDS_API_URL is not configured");
    }

    const identity = await getAppIdentity();
    const payload = {
        platform: identity.platform,
        appId: identity.appId,
        packageName: identity.packageName,
        version: identity.version,
        buildNumber: identity.buildNumber,
        deviceModel: identity.deviceModel,
        osVersion: identity.osVersion,
        deviceId: identity.deviceId,
    };

    const response = await fetch(`${apiUrl}/api/auth/challenge`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    const data: { nonce?: string; message?: string; success?: boolean } =
        await response.json();

    if (!response.ok || data.success === false || !data.nonce) {
        throw new Error(
            data.message ?? "Failed to request attestation challenge",
        );
    }

    return data.nonce;
}

async function exchangeAttestationForToken(
    nonce: string,
    proof: string,
    identity: Awaited<ReturnType<typeof getAppIdentity>>,
    keyId: string,
): Promise<AppAuthorizationSession> {
    const apiUrl = (process.env.EXPO_PUBLIC_VDS_API_URL ?? "").replace(
        /\/$/,
        "",
    );
    if (!apiUrl) {
        throw new Error("EXPO_PUBLIC_VDS_API_URL is not configured");
    }

    const response = await fetch(`${apiUrl}/api/auth/attestation`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            nonce,
            platform: identity.platform,
            appId: identity.appId,
            packageName: identity.packageName,
            version: identity.version,
            buildNumber: identity.buildNumber,
            deviceModel: identity.deviceModel,
            osVersion: identity.osVersion,
            deviceId: identity.deviceId,
            keyId,
            proof,
        } satisfies AppAuthorizationRequest),
    });

    const data: {
        success?: boolean;
        message?: string;
        token?: string;
        accessToken?: string;
        expiresAt?: number;
    } = await response.json();

    if (
        !response.ok ||
        data.success === false ||
        (!data.token && !data.accessToken)
    ) {
        throw new Error(data.message ?? "Unauthorized app attestation");
    }

    const token = data.token ?? data.accessToken ?? "";
    const expiresAt = data.expiresAt ?? Date.now() + 10 * 60 * 1000;

    await AsyncStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
    await AsyncStorage.setItem(AUTH_EXPIRES_AT_STORAGE_KEY, String(expiresAt));

    return {
        token,
        expiresAt,
    };
}

export async function getStoredAppAuthorization(): Promise<AppAuthorizationSession | null> {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    const expiresAt = Number(
        (await AsyncStorage.getItem(AUTH_EXPIRES_AT_STORAGE_KEY)) ?? "0",
    );

    if (
        !token ||
        !expiresAt ||
        Number.isNaN(expiresAt) ||
        expiresAt <= Date.now()
    ) {
        return null;
    }

    return {
        token,
        expiresAt,
    };
}

export async function ensureAppAuthorization(): Promise<string> {
    const cachedToken = await getStoredAppAuthorization();
    if (cachedToken?.token) {
        return cachedToken.token;
    }

    const identity = await getAppIdentity();
    const nonce = await requestAttestationChallenge();
    const deviceKey = await getOrCreateDeviceKey();
    const keyId = await getOrCreateKeyId();
    const proof = buildClientProof(nonce, deviceKey, identity);
    const session = await exchangeAttestationForToken(
        nonce,
        proof,
        identity,
        keyId,
    );

    return session.token;
}

export async function clearAppAuthorization(): Promise<void> {
    await AsyncStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    await AsyncStorage.removeItem(AUTH_EXPIRES_AT_STORAGE_KEY);
}

export async function authenticatedFetch(
    input: RequestInfo | URL,
    init: RequestInit = {},
): Promise<Response> {
    const token = await ensureAppAuthorization();
    const identity = await getAppIdentity();
    const requestHeaders = new Headers(init.headers ?? {});
    requestHeaders.set("Authorization", `Bearer ${token}`);
    requestHeaders.set("X-App-Platform", identity.platform);
    requestHeaders.set("X-App-Id", identity.appId);
    requestHeaders.set("X-App-Version", identity.version);

    return fetch(input, {
        ...init,
        headers: requestHeaders,
    });
}
