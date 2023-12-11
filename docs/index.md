# VDS Verify

## Nos app mobiles

`VDS Verify` est une application mobile (Android et iOS) de décodage et de vérification de Cachet Electronique Visible (CEV). Elle permet de décoder/vérifier les CEV (datamatrix et QR Code) selon les spécifications :

- 2D-Doc (ANTS)

  [https://ants.gouv.fr/nos-missions/les-solutions-numeriques/2d-doc](https://ants.gouv.fr/nos-missions/les-solutions-numeriques/2d-doc)

- CEV ISO 22376:2023

  [https://www.iso.org/standard/50278.html](https://www.iso.org/standard/50278.html)

- CEV AFNOR XP Z42-105

  [https://www.boutique.afnor.org/fr-fr/norme/xp-z42105/specifications-relatives-a-la-mise-en-oeuvre-du-cachet-electronique-visible/fa199910/238577](https://www.boutique.afnor.org/fr-fr/norme/xp-z42105/specifications-relatives-a-la-mise-en-oeuvre-du-cachet-electronique-visible/fa199910/238577)

## Notre solution de création de CEV

L'application mobile s'appuie sur notre API de création / encodage / signature et de décodage / vérification de CEV. Elle permet notamment de démontrer les capacités de notre API de décoder et vérifier les CEV créés par notre Solution de création de CEV.

### Ils l'utilisent

Notre solution de création, encodage et signature de CEV (AFNOR et ISO) est la seule utilisée aujourd'hui en production. Elle est mise en oeuvre par le Ministère de l'Intérieur pour la création des CEV apposés sur le [justificatif d'identité](https://france-identite.gouv.fr/justificatif/) de l'application [France Identité](https://france-identite.gouv.fr/)

Elle est en cours de déploiement pour la création des CEV apposés sur les attestations issues de Mon FranceConnect

### Fonctionnalités avancées

Notre solution de création de CEV permet de créer des CEV selon les _manifests_ définis et de les signer avec un certificat électronique qualifié.

- Conformité au standard ISO 22376:2023
- Conformité au standard AFNOR XP Z42-105
- Gestion des manifest
- Gestion des certificats et des clés de signature électronique
- Compatibilité avec les HSM (Hardware Security Module)
