import { Linking } from "react-native";
import { Text } from "@rneui/themed";
import AsyncStorage from "@react-native-async-storage/async-storage";

const label = {};

label.fr = {
  code: "fr",
  languageTag: "fr-FR",
  languageName: "Français",
  language: "Langue",
  about: "À propos",
  about_text: "VDS Verify est développé par Stelau.",
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
  invalid: "CEV Invalide",
  nonverifiable: "CEV Non Vérifiable",
  sign_not_verified: "La signature n'a pas pu être vérifiée",
  sign_not_authentic: "La signature n'est pas authentique",
  cert_issuer: "Emetteur",
  cert_cn: "Nom Commun",
  cert_not_after: "Non valide après",
  cert_not_before: "Non valide avant",
  cert_o: "Organisation",
  cert_ou: "Unité d'Organisation",
  standard: "Norme",
  compliance: "Conformité",
  scanagain: "Scanner à nouveau",
  helpscan: "Chercher un CEV à scanner",
  error: "Erreur",
  cameraerror: "VDS Verify a besoin d'accéder à votre caméra",
  camerapermission: "Demander l'accès",
  "Le CEV n'est pas authentique": "Le CEV n'est pas authentique",
  "Network request failed": "Erreur réseau",
  "Une erreur est survenue lors du décodage":
    "Le type de code n'est pas reconnu ou une erreur est survenue lors du décodage",
  certificate_reference: "Référence du certificat",
  iac: "Code de l'Agence émettrice",
  cin: "Numéro d'identification de l'entreprise",
  cf: "Code Format",
  manifest_ID: "ID du Manifeste",
  manifest_version: "Version du Manifeste",
  sign_datetime: "Date de Signature",
  testdata: "Données de Test",
  true: "oui",
  false: "non",
  // 2D-Doc header
  "Date d’émission du document": "Date d’émission du document",
  "Date de création de la signature": "Date de création de la signature",
  "Identifiant de l’autorité de certification":
    "Identifiant de l’autorité de certification",
  "Identifiant du certificat": "Identifiant du certificat",
  Version: "Version",
  "Type de document": "Type de document",
  Périmètre: "Périmètre",
  Pays: "Pays",
  historytoggle: "Conserver l'historique",
  history: "Voir l'historique",
  deleteHistory: "Supprimer l'historique",
};

label.en = {
  code: "en",
  languageTag: "en-US",
  languageName: "English",
  language: "Language",
  about: "About",
  about_text: "VDS Verify is developed by Stelau.",
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
  invalid: "Invalid VDS",
  nonverifiable: "Non-verifiable VDS",
  sign_not_verified: "The signature could not be verified",
  sign_not_authentic: "The signature is not authentic",
  cert_issuer: "Issuer",
  cert_cn: "Common Name",
  cert_not_after: "Not valid after",
  cert_not_before: "Not valid before",
  cert_o: "Organization",
  cert_ou: "Organizational Unit",
  standard: "Standard",
  compliance: "Compliance",
  scanagain: "Scan again",
  helpscan: "Find a VDS to scan",
  error: "Error",
  cameraerror: "VDS Verify needs access to your camera",
  camerapermission: "Request access",
  "Le CEV n'est pas authentique": "VDS is not authentic",
  "Network request failed": "Network error",
  "Une erreur est survenue lors du décodage":
    "Unknown QR code format or error during decoding",
  certificate_reference: "Certificate Reference",
  iac: "Issuing Agency Code",
  cin: "Company Identification Number",
  cf: "Code Format",
  manifest_ID: "Manifest ID",
  manifest_version: "Manifest Version",
  sign_datetime: "Signature Date",
  testdata: "Test Data",
  true: "yes",
  false: "no",
  // 2D-Doc header
  "Date d’émission du document": "Document Issue Date",
  "Date de création de la signature": "Signature Creation Date",
  "Identifiant de l’autorité de certification":
    "Certification Authority Identifier",
  "Identifiant du certificat": "Certificate Identifier",
  Version: "Version",
  "Type de document": "Document Type",
  Périmètre: "Scope",
  Pays: "Country",
  historytoggle: "Save history",
  history: "See history",
  deleteHistory: "Delete history",
};

const getLabel = (key, lang) => {
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
    if (value !== null && label[value]) {
      return value;
    } else throw new Error("no lang");
  } catch (e) {
    // If there is an error retrieving data, return default language
    return "en";
  }
};

const saveLang = async (lang) => {
  try {
    await AsyncStorage.setItem("lang", lang);
  } catch (e) {
    console.error(e);
  }
};

const isBase64 = (value) =>
  /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$/.test(
    value
  );

const formatString = (data) => {
  try {
    if (data.includes("http")) {
      return (
        <Text
          style={{
            color: "#0069b4",
            fontWeight: "bold",
            marginBottom: 10,
            fontSize: 16,
            textDecorationLine: "underline",
          }}
          onPress={() => Linking.openURL(data)}
        >
          {data}
        </Text>
      );
    } else {
      throw new Error("data is not a link");
    }
  } catch (error) {
    return data;
  }
};

const formatData = (data, lang) => {
  const languageTag = getLabel("languageTag", lang);
  try {
    if (Array.isArray(data)) {
      return data.join(" ").trim();
    } else if (typeof data === "boolean") {
      return data ? getLabel("true", lang) : getLabel("false", lang);
    } else if (typeof data === "string") {
      // Check if it's a phone number (starts with + and contains mostly digits)
      if (data.startsWith("+") && /^\+[\d\s\-\(\)]+$/.test(data)) {
        return formatString(data);
      }

      // Check if it looks like a date format (contains date separators or ISO format)
      const datePattern =
        /^\d{4}-\d{2}-\d{2}|^\d{2}\/\d{2}\/\d{4}|^\d{2}-\d{2}-\d{4}|\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
      if (!datePattern.test(data) || data.length < 8) {
        return formatString(data);
      }

      // Try to parse as date only if it matches date patterns
      let newdate = Date.parse(data);
      if (newdate > 1000) {
        const d = new Date(newdate);
        if (d.toString() !== "Invalid Date") {
          const dateString = d.toLocaleDateString(languageTag, {
            timeZone: "UTC",
          });
          if (!d.toUTCString().includes("00:00:00")) {
            return `${dateString} ${d.toLocaleTimeString(languageTag, { timeZone: "UTC", timeZoneName: "short" })}`;
          }
          return dateString;
        } else {
          throw new Error("data is not a date");
        }
      } else {
        throw new Error("data is not a date");
      }
    } else {
      return formatString(data);
    }
  } catch (error) {
    return formatString(data);
  }
};

export { getLang, saveLang, getLabel, formatData, isBase64 };
