const label = {};

label.fr = {
  code: "fr-FR",
  data: "Données",
  header: "En-tête",
  signer: "Signataire",
  "Type de document": "Type de document",
  scanagain: "Scanner à nouveau",
  helpscan: "Chercher un CEV à scanner",
  error: "Erreur",
  "Le CEV n'est pas authentique": "Le CEV n'est pas authentique.",
  "Network request failed": "Erreur réseau.",
  "Une erreur est survenue lors du décodage du CEV":
    "Le type de code n'est pas reconnu ou une erreur est survenue lors du décodage.",
};

label.en = {
  code: "en-US",
  data: "Data",
  header: "Header",
  signer: "Signer",
  "Type de document": "Document type",
  scanagain: "Scan again",
  helpscan: "Find VDS to scan",
  error: "Error",
  "Le CEV n'est pas authentique": "VDS is not authentic.",
  "Network request failed": "Network error.",
  "Une erreur est survenue lors du décodage du CEV":
    "Unknown QR code format or error during decoding.",
};

export default label;
