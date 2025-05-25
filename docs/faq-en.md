{% include nav.html %}

# Frequently Asked Questions

## What types of VDS are supported?

VDS Verify is able to decode and verify:

- All VDSs compliant with the AFNOR xp-z42105 standard, including those affixed to:

  - the single-use identity proof of [France Identity](https://france-identite.gouv.fr/justificatif/)
  - the certified digital identity request of [France Identity](https://france-identite.gouv.fr/identite-numerique-certifiee/)

- The 2D-Doc affixed to the following documents:
  - French national identity card
  - Restricted information statement (RIR)
  - Crit'Air sticker
  - Energy bill (EDF for example)
  - Phone bill (Free for example)
  - ... and any other document compliant with the 2D-Doc standard
- All VDSs compliant with the ISO 22376:2023 standard

## How does VDS verification work?

In order to verify the validity of a VDS, the VDS Verify application will:

- Decode the VDS
- Retrieve the electronic signature certificates in a TrustedList (trust list) issued by the [ANTS](https://ants.gouv.fr/)
- Verify the validity of the electronic signature certificate (validity date and revocation)
- Verify the electronic signature of the VDS.

## Are personal data stored?

The VDS to decode is transmitted to our decoding API which performs the operations detailed above and transmits the result and the decoded data. This API processes this data in memory and no information is stored in any form. The API does not generate any logs. The VDS Verify mobile app keeps a local history file containing the decoded VDS.
