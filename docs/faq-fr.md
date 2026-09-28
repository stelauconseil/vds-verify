---
layout: faq
lang: fr
alt_url: /faq-en.html
title: Questions fréquentes
description: "Questions fréquentes sur VDS Verify : qu'est-ce qu'un CEV ou un 2D-Doc, documents pris en charge, fonctionnement de la vérification de signature, confidentialité des données."
faq:
  - q: Qu'est-ce qu'un Cachet Électronique Visible (CEV) ?
    a: |
      Un Cachet Électronique Visible (CEV, en anglais *Visible Digital Seal* ou VDS) est un code 2D (Datamatrix ou QR Code) imprimé sur un document, qui contient les données essentielles du document et une signature électronique. En le scannant, on peut vérifier que le document a bien été émis par l'organisme indiqué et que ses données n'ont pas été modifiées.

      Les principaux formats sont le **2D-Doc** de l'[ANTS](https://ants.gouv.fr/nos-missions/les-solutions-numeriques/2d-doc), la norme française **AFNOR XP Z42-105** et la norme internationale **ISO 22376:2023**.
  - q: Quels sont les types de CEV pris en charge ?
    a: |
      L'application VDS Verify décode et vérifie :

      - **Tous les 2D-Doc**, dont ceux apposés sur les documents suivants :
        - Carte nationale d'identité française
        - Relevé d'information restreint (RIR)
        - Attestation de droits à conduire sécurisée (ADCS)
        - Vignette Crit'Air
        - Facture d'énergie (EDF par exemple)
        - Facture de téléphone (Free par exemple)
        - … et tout autre document conforme à la norme [2D-Doc](https://ants.gouv.fr/nos-missions/les-solutions-numeriques/2d-doc)
      - **Tous les CEV conformes à la norme AFNOR XP Z42-105**, dont ceux apposés sur les documents suivants :
        - Justificatif d'identité à usage unique de [France Identité](https://france-identite.gouv.fr/justificatif/)
        - Demande d'identité numérique certifiée de [France Identité](https://france-identite.gouv.fr/identite-numerique-certifiee/)
      - **Tous les CEV conformes à la norme ISO 22376:2023**, dont ceux apposés sur les documents suivants :
        - [Permis de conduire les bateaux de plaisance à moteur](https://www.mer.gouv.fr/le-permis-plaisance-permis-de-conduire-les-bateaux-de-plaisance-moteur#summary-target-0)
  - q: Comment vérifier un justificatif d'identité France Identité ?
    a: |
      Ouvrez VDS Verify et scannez le code 2D imprimé sur le justificatif. L'application vérifie la signature électronique du cachet et affiche les données du justificatif (nom, prénoms, date de naissance, durée de validité, destinataire). Si les données affichées correspondent au document présenté et que le statut est « CEV valide », le justificatif est authentique.
  - q: Comment fonctionne la vérification d'un CEV ?
    a: |
      Afin de décoder et vérifier un CEV, l'application VDS Verify :

      1. Scanne et décode le Datamatrix ou le QR Code ;
      2. Récupère les certificats de signature électronique dans une Trusted List (liste de confiance) émise par l'[ANTS](https://ants.gouv.fr/) ;
      3. Vérifie la validité du certificat électronique de signature (date de validité et révocation) ;
      4. Vérifie la signature électronique du CEV ;
      5. Affiche les données décodées et les informations sur la signature électronique.
  - q: VDS Verify est-elle gratuite ?
    a: |
      Oui. VDS Verify est gratuite, sans compte ni publicité, sur [iPhone](https://apps.apple.com/fr/app/vds-verify/id6463440128) et [Android](https://play.google.com/store/apps/details?id=com.stelau.vdsverify).
  - q: Les données personnelles sont-elles stockées ?
    a: |
      Le CEV à décoder est transmis à notre API de décodage, qui réalise les opérations détaillées plus haut et renvoie le résultat et les données décodées. Cette API traite ces données en mémoire : aucune information n'est stockée sous quelque forme que ce soit et l'API ne génère aucun log.

      L'application mobile VDS Verify conserve un historique local, sur votre téléphone uniquement, qui contient les résultats des décodages.
  - q: Qui peut créer des CEV ?
    a: |
      VDS Verify s'appuie sur l'API de création, encodage et signature de CEV de Stelau, utilisée en production notamment par le Ministère de l'Intérieur pour [France Identité](https://france-identite.gouv.fr/justificatif/). Pour intégrer la création de CEV dans vos documents, [contactez-nous](mailto:contact@stelau.com).
---
