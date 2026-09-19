import assert from "node:assert/strict";
import test from "node:test";
import { getLocalizedDocumentType } from "../src/types/document-type.ts";
import { normalizeVdsResult } from "../src/types/vds.ts";

test("manifest 000405 survives normalization and history serialization", () => {
    const documentType = {
        nomDuTypeDocument: { fr: "Permis de Conduire - Bateaux de Plaisance à Moteur" },
        descriptionDuTypeDocument: { fr: "Attestation de droits" },
    };
    const result = normalizeVdsResult({
        header: { manifest_ID: "000405", "Type de document": documentType },
        data: {},
    });
    const history = JSON.parse(JSON.stringify([{ data: result }]));
    const restored = normalizeVdsResult(history[0].data);
    assert.deepEqual(restored.header["Type de document"], documentType);
    for (const lang of ["fr", "fr-FR", "en"]) {
        assert.equal(
            getLocalizedDocumentType(restored.header["Type de document"], lang),
            "Permis de Conduire - Bateaux de Plaisance à Moteur — Attestation de droits",
        );
    }
});

test("legacy history formats and language selection remain supported", () => {
    assert.equal(getLocalizedDocumentType("Permis", "fr"), "Permis");
    assert.equal(getLocalizedDocumentType({ fr: "Permis", en: "Licence" }, "en-GB"), "Licence");
    assert.equal(getLocalizedDocumentType({ nomDuTypeDocument: { fr: "Permis", en: "Licence" } }, "en"), "Licence");
    assert.equal(getLocalizedDocumentType({ fr: "", en: "Licence" }, "fr"), "Licence");
    assert.equal(getLocalizedDocumentType(null, "fr"), undefined);
});
