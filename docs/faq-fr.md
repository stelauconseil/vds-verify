# Questions fréquentes

## Quel sont les types de CEV pris en charge ?

L'application VDS Verify décode et vérifie:

- Tous les 2D-Doc, dont ceux apposés sur les documents suivants:

  - Carte nationale d'identité française
  - Relevé d'information restreint (RIR)
  - Attestation de droits à conduire sécurisée (ADCS)
  - Vignette Crit'Air
  - Facture d'énergie (EDF par exemple)
  - Facture de téléphone (Free par exemple)
  - ... et tout autre document conformes à la norme [2D-Doc](https://ants.gouv.fr/nos-missions/les-solutions-numeriques/2d-doc)

- Tous les CEV conformes à la norme AFNOR xp-z42105, dont ceux apposés sur les documents suivants:

  - Justificatif d'identité à usage unique de [France Identité](https://france-identite.gouv.fr/justificatif/)
  - Demande d'identité numérique certifiée de [France Identité](https://france-identite.gouv.fr/identite-numerique-certifiee/)

- Tous les CEV conformes à la norme ISO 22376:2023, dont ceux apposés sur les documents suivants:

  - [Permis de conduire les bateaux de plaisance à moteur](https://www.mer.gouv.fr/le-permis-plaisance-permis-de-conduire-les-bateaux-de-plaisance-moteur#summary-target-0)

## Comment fonctionne la vérification d'un CEV ?

Afin de vérifier la validité d'un CEV, l'application VDS Verify va:

- Décoder le CEV
- Récupérer les certificats de signature électronique dans une TrustedList (liste de confiance) émise par l'[ANTS](https://ants.gouv.fr/)
- Vérifier la validité du certificat électronique de signature (date de validité et révocation)
- Vérifier la signature électronique du CEV.

## Les données personnelles sont-elles stockées ?

Le CEV a décoder est transmis à notre API de décodage qui réalise les opérations détaillées plus haut et transmet le résultat et les données décodées. Cette API traite ces données en mémoire et aucune information n'est stockée sous quelque forme que ce soit. L'API ne génère aucun log. L'application mobile VDS Verify conserve un hisorique local qui contient les résulats des décodages.
