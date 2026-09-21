import type { VdsResult } from "./types/vds";

// API examples preserved verbatim; history metadata is added by the caller.
export const testResults: VdsResult[] = [
    {
        data: {
            destinataire: "ANTS",
            "durée de validité": { durée: 30, unité: "j" },
            "motif d'utilisation": "",
            "nom d'usage": "NOM D'USAGE",
            "nom de naissance": "MARTIN",
            prénoms: "Maëlis-Gaëlle Marie",
            sexe: "F",
            "date de naissance": "13/07/1990",
            "lieu de naissance": "PARIS",
            nationalité: "FRA",
        },
        header: {
            marqueurIdentification: "DE",
            version: "02",
            manifest_ID: "4A49",
            manifest_version: "02",
            certificate_reference: "FR05FIN2",
            sign_datetime: "2026-09-21 09:04:10",
            length: 74,
            "Type de document": {
                nomDuTypeDocument: {
                    en: "Identity Proof",
                    fr: "Justificatif d'identité",
                },
                descriptionDuTypeDocument: {
                    en: "Temporary Identity document",
                    fr: "Justificatif d'identité à usage unique",
                },
            },
        },
        signer: {
            cert_cn: "FIN2",
            cert_o: "Agence Nationale des Titres Sécurisés",
            cert_ou: "0002 130003262",
            cert_issuer: "FR05-test (ANTS)",
            cert_not_before: "Mon, 14 Sep 2026 12:27:07 GMT",
            cert_not_after: "Fri, 14 Sep 2029 12:27:07 GMT",
        },
        vds_standard: "DOC_105",
        testdata: false,
        sign_is_valid: true,
    },
    {
        data: {
            "Nombre de pages du document": "0001",
            "Liste des prénoms": ["DAVID"],
            "Date de naissance": "2000-06-03",
            "Lieu de naissance": "BELLEYDOUX",
            Nom: "GUY",
            Civilité: "MADAME",
            "N° Dossier": "170231164713",
            "Type de relevé de permis de conduire":
                "RIR - Relevé d'Information Restreint",
            "Etat du permis de conduire du conducteur": "SUSPENDU",
            "Date des données issues du SNPC": "2025-04-16 20:28",
            "Catégories présentes de permis de conduire": [""],
        },
        header: {
            "Date d’émission du document": "2025-04-16",
            "Date de création de la signature": "2025-04-16",
            "Identifiant de l’autorité de certification": "FR00",
            "Identifiant du certificat": "TES0",
            Version: "4",
            "Type de document": "Relevé d'Information Permis de conduire",
            Périmètre: "01",
            Pays: "FR",
        },
        signer: {
            cert_cn: "FIN2",
            cert_o: "Agence Nationale des Titres Sécurisés",
            cert_ou: "0002 130003262",
            cert_issuer: "FR05-test (ANTS)",
            cert_not_before: "Mon, 14 Sep 2026 12:27:07 GMT",
            cert_not_after: "Fri, 14 Sep 2029 12:27:07 GMT",
        },
        vds_standard: "DOC_101",
        testdata: false,
        sign_is_valid: true,
    },
];
