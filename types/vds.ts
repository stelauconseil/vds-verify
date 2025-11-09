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
