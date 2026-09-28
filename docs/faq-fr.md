---
lang: fr
alt_url: /faq-en.html
title: Questions fréquentes
---

# Questions fréquentes

<details open markdown="1">
<summary>Quels sont les types de CEV pris en charge ?</summary>

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

</details>

<details markdown="1">
<summary>Comment fonctionne la vérification d'un CEV ?</summary>

Afin de décoder et vérifier un CEV, l'application VDS Verify :

1. Scanne et décode le Datamatrix ou le QR Code ;
2. Récupère les certificats de signature électronique dans une Trusted List (liste de confiance) émise par l'[ANTS](https://ants.gouv.fr/) ;
3. Vérifie la validité du certificat électronique de signature (date de validité et révocation) ;
4. Vérifie la signature électronique du CEV ;
5. Affiche les données décodées et les informations sur la signature électronique.

</details>

<details markdown="1">
<summary>Les données personnelles sont-elles stockées ?</summary>

Le CEV à décoder est transmis à notre API de décodage, qui réalise les opérations détaillées plus haut et renvoie le résultat et les données décodées. Cette API traite ces données en mémoire : aucune information n'est stockée sous quelque forme que ce soit et l'API ne génère aucun log.

L'application mobile VDS Verify conserve un historique local, sur votre téléphone uniquement, qui contient les résultats des décodages.

</details>

<details markdown="1">
<summary>Qui peut créer des CEV ?</summary>

VDS Verify s'appuie sur notre API de création, encodage et signature de CEV, utilisée en production notamment par le Ministère de l'Intérieur pour [France Identité](https://france-identite.gouv.fr/justificatif/). Pour intégrer la création de CEV dans vos documents, [contactez-nous](mailto:{{ site.contact_email }}).

</details>
