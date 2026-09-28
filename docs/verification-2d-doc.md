---
lang: fr
alt_url: /en/2d-doc-verification.html
title: "Vérification 2D-Doc : comment vérifier un 2D-Doc gratuitement"
description: "Vérifiez gratuitement un 2D-Doc ou un CEV (justificatif de domicile, avis d'impôt, CNI, France Identité) avec la technologie utilisée par France Titres (ANTS) et France Identité."
---

# Vérification 2D-Doc : vérifier l'authenticité d'un document

Le **2D-Doc** est le code-barres Datamatrix signé que l'on trouve sur les justificatifs de domicile, avis d'impôt, factures d'énergie ou de téléphone, cartes d'identité et de nombreux documents officiels français. **Vérifier un 2D-Doc** permet de s'assurer en quelques secondes qu'un document a bien été émis par l'organisme indiqué et que ses données n'ont pas été modifiées.

## Une technologie éprouvée à l'échelle nationale

VDS Verify fait partie des [applications reconnues par France Titres](https://ants.gouv.fr/nos-missions/les-solutions-numeriques/2d-doc#comment-lire-un-2d-doc-) pour lire les 2D-Doc. Elle est éditée par [Stelau](https://www.stelau.com), dont la technologie de Cachets Électroniques Visibles (CEV) est utilisée en production par l'État :

- **France Titres (ANTS)** : le [service officiel de vérification 2D-Doc](https://web.2ddoc.services.ants.gouv.fr/) utilise notre API.
- **France Identité** : notre SDK de vérification est intégré à l'application [France Identité](https://france-identite.gouv.fr/), utilisée par plus de 5 millions de personnes, et notre API génère les CEV de ses [justificatifs d'identité](https://france-identite.gouv.fr/justificatif/).

## Comment vérifier un 2D-Doc gratuitement

1. **Téléchargez VDS Verify**, gratuit et sans compte, sur [iPhone]({{ site.appstore_url }}) ou [Android]({{ site.playstore_url }}).
2. **Scannez le code 2D-Doc** du document, imprimé sur papier ou affiché à l'écran.
3. **Lisez le résultat** : l'application indique si la signature est valide, affiche les données signées et le détail du certificat.
4. **Comparez** les données décodées avec celles imprimées sur le document. Une différence signale une falsification.

## Ce que vérifie un contrôle 2D-Doc

Un 2D-Doc contient les données clés du document (nom, adresse, montant, date…) et une **signature électronique** de l'émetteur. La vérification consiste à :

- décoder le Datamatrix et son en-tête (version, autorité de certification, certificat, type de document) ;
- récupérer le certificat de l'émetteur dans la **liste de confiance (TSL) de l'ANTS** ;
- contrôler la validité du certificat (dates, révocation) ;
- vérifier cryptographiquement la signature des données.

Si l'une de ces étapes échoue, le document ne doit pas être considéré comme authentique.

## Documents portant un 2D-Doc ou un CEV

- Justificatifs de domicile : factures d'énergie (électricité, gaz), de téléphone et d'internet
- Avis d'impôt sur le revenu
- Carte nationale d'identité
- Justificatif d'identité France Identité
- Relevé d'information restreint (RIR) et attestation de droits à conduire (ADCS)
- Permis bateau de plaisance
- Vignette Crit'Air

## 2D-Doc, CEV, AFNOR et ISO 22376 : les normes

Le **2D-Doc** a été créé par l'ANTS (aujourd'hui France Titres) et normalisé par l'AFNOR (série XP Z42-101 à 104). Il a évolué vers le **Cachet Électronique Visible** défini par la norme **AFNOR XP Z42-105**, puis par la norme internationale **ISO 22376:2023**. VDS Verify prend en charge les trois formats.

## Vérification 2D-Doc pour les entreprises : API et SDK

Pour vérifier des 2D-Doc à grande échelle (KYC, dossiers de location, crédit, RH) ou pour **créer et signer vos propres CEV**, Stelau propose :

- une **API** de création, signature, décodage et vérification de CEV, conforme AFNOR XP Z42-105 et ISO 22376:2023, compatible HSM et certificats qualifiés ;
- un **SDK mobile** de vérification, déjà déployé auprès de plus de 5 millions d'utilisateurs via France Identité.

[Contactez-nous](mailto:{{ site.contact_email }}?subject=API%20%2F%20SDK%202D-Doc) pour une démonstration.

## Questions fréquentes

Consultez la [FAQ]({{ '/faq-fr.html' | relative_url }}) pour en savoir plus sur les CEV, les documents pris en charge et la confidentialité des données.
