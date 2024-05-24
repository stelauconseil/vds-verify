# Questions fréquentes

## Quel sont les types de CEV pris en charge ?

L'application VDS Verify est en mesure de décoder et vérifier:

- Les 2D-Doc apposés sur les documents suivants:
  - Carte nationale d'identité française
  - Relevé d'information restreint (RIR)
  - Vignette Crit'Air
  - Facture d'énergie (EDF par exemple)
  - Facture de téléphone (Free par exemple)
  - ... et tout autre document conforme à la norme [2D-Doc](https://ants.gouv.fr/nos-missions/les-solutions-numeriques/2d-doc)
- Tous les CEV conforme à la norme AFNOR xp-z42105, dont notamment ceux apposés sur :

  - le justificatif d'identité à usage unique de [France Identité](https://france-identite.gouv.fr/justificatif/)
  - la demande d'identité numérique certifiée de [France Identité](https://france-identite.gouv.fr/identite-numerique-certifiee/)

- Tous les CEV conforme à la norme ISO 22376:2023

## Comment fonctionne la vérification d'un CEV ?

Afin de vérifier la validité d'un CEV, l'application VDS Verify va:

- Décoder le CEV
- Récupérer les certificats de signature électronique dans une TrustedList (liste de confiance) émise par l'[ANTS](https://ants.gouv.fr/)
- Vérifier la validité du certificat électronique de signature (date de validité et révocation)
- Vérifier la signature électronique du CEV.

## Les données personnelles sont-elles stockées ?

Non, l'application VDS Verify ne stocke aucune donnée personnelle. Le CEV a décoder est transmis à notre API de décodage qui réalise les opérations détaillées plus haut et transmet le résultat et les données décodées. Cette API traite ces données en mémoire et aucune information n'est stockée sous quelque forme que ce soit. L'API ne génère aucun log.
