// Data Matrix ECC 200 data codewords -> message bytes (ISO/IEC 16022 §5.2).
// iOS only hands out the symbol's text (AVFoundation stringValue), which is cut at the first
// 0x00 byte and loses binary content such as ICAO seals; the error-corrected codewords
// (CIDataMatrixCodeDescriptor.errorCorrectedPayload) are complete, so they are decoded here.

const PAD = 129;
const UNLATCH = 254;

// Base 256 codewords are scrambled with their 1-based position in the symbol (Annex B).
function unrandomize255(codeword: number, position: number): number {
    const value = codeword - (((149 * position) % 255) + 1);
    return value >= 0 ? value : value + 256;
}

function base256(cw: Uint8Array, i: number, out: number[]): number {
    const d1 = unrandomize255(cw[i], i + 1);
    i++;
    let length: number;
    if (d1 === 0) length = cw.length - i;
    else if (d1 < 250) length = d1;
    else {
        length = 250 * (d1 - 249) + unrandomize255(cw[i], i + 1);
        i++;
    }
    if (i + length > cw.length) throw new Error("Truncated Base 256 field");
    for (const end = i + length; i < end; i++)
        out.push(unrandomize255(cw[i], i + 1));
    return i;
}

const C40_BASIC = [
    -1,
    -1,
    -1,
    32,
    ..."0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
].map((c) => (typeof c === "number" ? c : c.charCodeAt(0)));
const TEXT_BASIC = C40_BASIC.map((c) => (c >= 65 && c <= 90 ? c + 32 : c));
const X12 = [13, 42, 62, 32, ..."0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"].map(
    (c) => (typeof c === "number" ? c : c.charCodeAt(0)),
);
const SHIFT2 = [..."!\"#$%&'()*+,-./:;<=>?@[\\]^_"].map((c) => c.charCodeAt(0));

// C40 (230), Text (239) and X12 (238): three values per pair of codewords.
function triplets(
    cw: Uint8Array,
    i: number,
    out: number[],
    mode: number,
): number {
    let shift = 0;
    let upper = 0;
    const emit = (c: number) => {
        out.push(c + upper);
        upper = 0;
    };
    while (i + 1 < cw.length && cw[i] !== UNLATCH) {
        const v = cw[i] * 256 + cw[i + 1] - 1;
        i += 2;
        for (const value of [
            Math.floor(v / 1600),
            Math.floor(v / 40) % 40,
            v % 40,
        ]) {
            if (mode === 238) {
                emit(X12[value]);
            } else if (shift === 1) {
                emit(value);
                shift = 0;
            } else if (shift === 2) {
                if (value < SHIFT2.length) emit(SHIFT2[value]);
                else if (value === 27)
                    emit(29); // FNC1
                else if (value === 30) upper = 128;
                else throw new Error("Invalid C40/Text shift 2 value");
                shift = 0;
            } else if (shift === 3) {
                // 0: '`', 1-26: the other case's letters, 27-31: '{' .. DEL
                emit(
                    value === 0
                        ? 96
                        : value <= 26
                          ? (mode === 230 ? 96 : 64) + value
                          : 96 + value,
                );
                shift = 0;
            } else if (value < 3) {
                shift = value + 1;
            } else {
                emit((mode === 230 ? C40_BASIC : TEXT_BASIC)[value]);
            }
        }
    }
    return cw[i] === UNLATCH ? i + 1 : i;
}

// EDIFACT (240): four 6-bit values per three codewords, 31 returns to ASCII.
function edifact(cw: Uint8Array, i: number, out: number[]): number {
    while (cw.length - i > 2) {
        const bits = (cw[i] << 16) | (cw[i + 1] << 8) | cw[i + 2];
        for (let k = 0; k < 4; k++) {
            const value = (bits >> (18 - 6 * k)) & 0x3f;
            if (value === 31) return i + Math.ceil((6 * (k + 1)) / 8);
            out.push(value & 0x20 ? value : value | 0x40);
        }
        i += 3;
    }
    return i;
}

export function decodeDataMatrixCodewords(cw: Uint8Array): Uint8Array | null {
    const out: number[] = [];
    let upper = 0;
    try {
        for (let i = 0; i < cw.length;) {
            const c = cw[i++];
            if (c === PAD) break;
            if (c <= 128) {
                out.push(c - 1 + upper);
                upper = 0;
            } else if (c <= 229) {
                const n = c - 130;
                out.push(48 + Math.floor(n / 10), 48 + (n % 10));
            } else if (c === 230 || c === 238 || c === 239)
                i = triplets(cw, i, out, c);
            else if (c === 231) i = base256(cw, i, out);
            else if (c === 232)
                out.push(29); // FNC1 -> GS
            else if (c === 235) upper = 128;
            else if (c === 240) i = edifact(cw, i, out);
            else if (c === 241)
                i += cw[i] < 128 ? 1 : cw[i] < 192 ? 2 : 3; // ECI ignored
            else return null; // structured append, reader programming, macros
        }
    } catch {
        return null;
    }
    return Uint8Array.from(out);
}
