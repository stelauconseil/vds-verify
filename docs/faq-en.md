# Frequently Asked Questions

## What types of CEV are supported?

VDS Verify is able to decode and verify:

- All CEVs compliant with the AFNOR xp-z42105 standard

  - Today we list those affixed to the single-use identity proof of [France Identity](https://france-identite.gouv.fr/justificatif/)

- The 2D-Doc affixed to the following documents:
  - French national identity card
  - Restricted information statement (RIR)
  - Crit'Air sticker
  - Energy bill (EDF for example)
  - Phone bill (Free for example)
  - ... and any other document compliant with the 2D-Doc standard
- All CEVs compliant with the ISO 22376:2023 standard

## How does CEV verification work?

In order to verify the validity of a CEV, the VDS Verify application will:

- Decode the CEV
- Retrieve the electronic signature certificates in a TrustedList (trust list) issued by the ANTS
- Verify the validity of the electronic signature certificate (validity date and revocation)
- Verify the electronic signature of the CEV.

## Are personal data stored?

No, the VDS Verify application does not store any personal data. The CEV to decode is transmitted to our decoding API which performs the operations detailed above and transmits the results and the decoded data. This API processes these data in memory and no information is stored in any form. The API does not generate any logs.