import assert from "node:assert/strict";
import test from "node:test";
import { filterHistory } from "../src/types/history-filter.ts";

const entries = [
    { timestamp: "2026-09-20T12:00:00Z", pinned: true, data: { header: { "Type de document": { nomDuTypeDocument: { fr: "Justificatif d’identité", en: "Identity proof" } } }, data: { name: "Maëlis" }, sign_is_valid: true, signer: { cert_o: "ANTS" } } },
    { timestamp: "2026-09-22T12:00:00Z", data: { header: { "Type de document": "Permis" }, sign_is_valid: false, signer: {} } },
    { timestamp: "2026-09-21T12:00:00Z", data: { sign_is_valid: true } },
];

test("search matches accents, nested translations, signer and localized dates", () => {
    assert.deepEqual(filterHistory(entries, "IDENTITE maelis ants", "all", "fr-FR"), [entries[0]]);
    assert.deepEqual(filterHistory(entries, "identity", "pinned", "en-US"), [entries[0]]);
    assert.deepEqual(filterHistory(entries, "22/09/2026", "all", "fr-FR"), [entries[1]]);
});

test("review includes invalid signatures and missing signers; filters combine with search", () => {
    assert.deepEqual(filterHistory(entries, "", "review", "fr"), [entries[1], entries[2]]);
    assert.deepEqual(filterHistory(entries, "Permis", "pinned", "fr"), []);
    assert.deepEqual(filterHistory(entries, "unknown", "all", "fr"), []);
});

test("pinned entries come first, then newest; source order remains unchanged", () => {
    const input = [entries[2], entries[1], entries[0]];
    assert.deepEqual(filterHistory(input, "  ", "all", "fr"), entries);
    assert.deepEqual(input, [entries[2], entries[1], entries[0]]);
    assert.deepEqual(filterHistory([], "", "all", "fr"), []);
});
