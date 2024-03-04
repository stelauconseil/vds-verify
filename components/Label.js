import { getLocales } from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";

const label = {};

label.fr = {
  code: "fr",
  languageTag: "fr-FR",
  languageName: "Français",
  language: "Langue",
  about: "À propos",
  close: "Fermer",
  privacypolicy: "Politique de confidentialité",
  faq: "FAQ",
  usepolicy: "Conditions d'utilisation",
  information: "Informations",
  scan: "Scanner",
  settings: "Paramètres",
  data: "Données",
  header: "En-tête",
  signer: "Signataire",
  valid: "CEV Valide",
  nonverifiable: "CEV Non Vérifiable",
  sign_not_verified: "La signature n'a pas pu être vérifiée",
  cert_issuer: "Emetteur",
  cert_cn: "Nom Commun",
  cert_not_after: "Non valide avant",
  cert_not_before: "Non valide après",
  cert_o: "Organisation",
  cert_ou: "Unité d'organisation",
  standard: "Norme",
  compliance: "Conformité",
  "Type de document": "Type de document",
  scanagain: "Scanner à nouveau",
  helpscan: "Chercher un CEV à scanner",
  error: "Erreur",
  cameraerror: "VDS Verify a besoin d'accéder à votre caméra",
  camerapermission: "Demander l'accès",
  "Le CEV n'est pas authentique": "Le CEV n'est pas authentique",
  "Network request failed": "Erreur réseau",
  "Une erreur est survenue lors du décodage du CEV":
    "Le type de code n'est pas reconnu ou une erreur est survenue lors du décodage",
  certificate_reference: "Référence du certificat",
  iac: "Code de l'Agence émettrice ",
  manifest_ID: "ID du manifeste",
  manifest_version: "Version du manifeste",
  sign_datetime: "Date et heure de signature",
  testdata: "Données de test",
};

label.en = {
  code: "en",
  languageTag: "en-US",
  languageName: "English",
  language: "Language",
  about: "About",
  close: "Close",
  privacypolicy: "Privacy policy",
  faq: "FAQ",
  usepolicy: "Terms of use",
  information: "Information",
  scan: "Scan",
  settings: "Settings",
  data: "Data",
  header: "Header",
  signer: "Signature",
  valid: "Valid VDS",
  nonverifiable: "Non-verifiable VDS",
  sign_not_verified: "The signature could not be verified",
  cert_issuer: "Issuer",
  cert_cn: "Common Name",
  cert_not_after: "Not valid after",
  cert_not_before: "Not valid before",
  cert_o: "Organization",
  cert_ou: "Organizational unit",
  standard: "Standard",
  compliance: "Compliance",
  "Type de document": "Document type",
  scanagain: "Scan again",
  helpscan: "Find a VDS to scan",
  error: "Error",
  cameraerror: "VDS Verify needs access to your camera",
  camerapermission: "Request access",
  "Le CEV n'est pas authentique": "VDS is not authentic",
  "Network request failed": "Network error",
  "Une erreur est survenue lors du décodage du CEV":
    "Unknown QR code format or error during decoding",
  certificate_reference: "Certificate reference",
  iac: "Issuing Agency Code",
  manifest_ID: "Manifest ID",
  manifest_version: "Manifest version",
  sign_datetime: "Signature date and time",
  testdata: "Test data",
};

const getLabel = (lang, key) => {
  if (lang && key in label[lang]) {
    return label[lang][key];
  } else if (key in label.en) {
    return label.en[key];
  }
  return key;
};

const getLang = async () => {
  try {
    const value = await AsyncStorage.getItem("lang");
    if (value !== null) {
      return value;
    } else throw new Error("no lang");
  } catch (e) {
    // console.error(e);
    const l = getLocales();
    return l[0].languageCode;
  }
};

const saveLang = async (lang) => {
  try {
    await AsyncStorage.setItem("lang", lang);
  } catch (e) {
    console.error(e);
  }
};

const formatData = (data, lang) => {
  try {
    const languageTag = getLabel(lang, "languageTag");
    if (Array.isArray(data)) {
      return data.join(" ");
    } else if (data.length < 10) {
      throw new Error("data is not a date");
    } else {
      let newdate = Date.parse(data);
      if (newdate > 1000) {
        const d = new Date(newdate);
        if (d.toString() !== "Invalid Date") {
          const dateString = d.toLocaleDateString(languageTag);
          if (!d.toUTCString().includes("00:00:00")) {
            return `${dateString} ${d.toLocaleTimeString(languageTag)}`;
          }
          return dateString;
        }
        return data;
      } else {
        throw new Error("data is not a date");
      }
    }
  } catch (error) {
    return data;
  }
};

export { getLang, saveLang, getLabel, formatData };
