import { getLocales } from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";

const label = {};

label.fr = {
  code: "fr",
  languageTag: "fr-FR",
  languageName: "Français",
  language: "Langue",
  scan: "Scanner",
  settings: "Paramètres",
  data: "Données",
  header: "En-tête",
  signer: "Signataire",
  "Type de document": "Type de document",
  scanagain: "Scanner à nouveau",
  helpscan: "Chercher un CEV à scanner",
  error: "Erreur",
  cameraerror: "No access to camera",
  camerapermission: "Requesting for camera permission",
  "Le CEV n'est pas authentique": "Le CEV n'est pas authentique",
  "Network request failed": "Erreur réseau",
  "Une erreur est survenue lors du décodage du CEV":
    "Le type de code n'est pas reconnu ou une erreur est survenue lors du décodage",
};

label.en = {
  code: "en",
  languageTag: "en-US",
  languageName: "English",
  language: "Language",
  scan: "Scan",
  settings: "Settings",
  data: "Data",
  header: "Header",
  signer: "Signer",
  "Type de document": "Document type",
  scanagain: "Scan again",
  helpscan: "Find a VDS to scan",
  error: "Error",
  cameraerror: "No access to camera",
  camerapermission: "Requesting for camera permission",
  "Le CEV n'est pas authentique": "VDS is not authentic",
  "Network request failed": "Network error",
  "Une erreur est survenue lors du décodage du CEV":
    "Unknown QR code format or error during decoding",
};

const getLabel = (lang, key) => {
  if (lang && label[lang]) {
    return label[lang][key];
  }
  return label.en[key];
};

const getLang = async () => {
  try {
    const value = await AsyncStorage.getItem("lang");
    if (value !== null) {
      return value;
    } else throw new Error("no lang");
  } catch (e) {
    console.error(e);
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

export { getLang, saveLang, getLabel };
