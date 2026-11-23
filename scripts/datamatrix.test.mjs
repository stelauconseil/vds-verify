import assert from "node:assert/strict";
import test from "node:test";
import { decodeDataMatrixCodewords } from "../src/datamatrix.ts";

const decode = (codewords) =>
    Buffer.from(decodeDataMatrixCodewords(Uint8Array.from(codewords))).toString(
        "latin1",
    );

// Base 256 encoder (ISO/IEC 16022 Annex B): latch 231 at position 1, then length + data.
function base256Codewords(bytes) {
    const randomize = (value, position) =>
        (value + ((149 * position) % 255) + 1) % 256;
    const cw = [231];
    [bytes.length, ...bytes].forEach((b) =>
        cw.push(randomize(b, cw.length + 1)),
    );
    return cw;
}

// BSI TR-03137 Annex C seal: 144 bytes with a 0x00 at offset 136, where iOS stringValue stops.
const ANNEX_C = Buffer.from(
    "dc026abc6d32c8a519fc0f71341145f4fd020230a5621353d9a275735bd4134bc549133c133c133c133c133c" +
        "a32519a519a4344a5e681ae7204b20d532cf4b7c133c133f030820d5201019a51aeaff404a1f218ca4392647" +
        "ecff6c8abf9e796a78eebe0b1ac8cc25c4ee17eed961d1189091358d7d616f1a517abc747f6c4490ff159d4d" +
        "cf50248b00b1e32e9e7805e7",
    "hex",
);

test("Base 256 keeps every byte, 0x00 included", () => {
    const decoded = decodeDataMatrixCodewords(
        Uint8Array.from([...base256Codewords(ANNEX_C), 129]),
    );
    assert.deepEqual(Buffer.from(decoded), ANNEX_C);
});

test("ASCII: characters, digit pairs, upper shift and pad", () => {
    assert.equal(
        decode([66, 142, 164, 186, 235, 92, 129, 1, 2]),
        "A123456\xdb",
    );
});

test("C40 (ISO/IEC 16022 example) then unlatch to ASCII", () => {
    assert.equal(decode([230, 91, 11, 91, 11, 91, 11, 254, 66]), "AIMAIMAIMA");
});

test("Text mode decodes lower case", () => {
    // "aim" = 14, 22, 26 in the Text basic set
    assert.equal(decode([239, 91, 11, 254]), "aim");
});

test("truncated Base 256 field is rejected", () => {
    assert.equal(
        decodeDataMatrixCodewords(
            Uint8Array.from(base256Codewords(ANNEX_C).slice(0, 50)),
        ),
        null,
    );
});
