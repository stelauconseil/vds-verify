export type Primitive = string | number | boolean;
export type DataValue =
    | Primitive
    | DataValue[]
    | { [k: string]: DataValue }
    | null
    | undefined;

export interface VdsResult {
    data: { [k: string]: DataValue };
    header: Record<string, Primitive | null | undefined>;
    signer?: Record<string, Primitive | null | undefined>;
    vds_standard?: string;
    testdata?: boolean;
    sign_is_valid?: boolean;
}

type UnknownRecord = Record<string, unknown>;

function isPlainObject(value: unknown): value is UnknownRecord {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toDataRecord(value: unknown): { [k: string]: DataValue } {
    if (!isPlainObject(value)) return {};
    return value as { [k: string]: DataValue };
}

function toPrimitiveRecord(
    value: unknown,
): Record<string, Primitive | null | undefined> {
    if (!isPlainObject(value)) return {};
    return value as Record<string, Primitive | null | undefined>;
}

export function normalizeVdsResult(value: unknown): VdsResult | null {
    if (!isPlainObject(value)) return null;

    const data = toDataRecord(value.data);
    const header = toPrimitiveRecord(value.header);
    const signer = isPlainObject(value.signer)
        ? toPrimitiveRecord(value.signer)
        : undefined;

    const hasContent =
        Object.keys(data).length > 0 || Object.keys(header).length > 0;
    if (!hasContent) return null;

    return {
        data,
        header,
        signer,
        vds_standard:
            typeof value.vds_standard === "string"
                ? value.vds_standard
                : undefined,
        testdata:
            typeof value.testdata === "boolean" ? value.testdata : undefined,
        sign_is_valid:
            typeof value.sign_is_valid === "boolean"
                ? value.sign_is_valid
                : undefined,
    };
}
