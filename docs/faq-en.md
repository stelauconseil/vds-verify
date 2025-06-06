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

To verify the decoding of a CEV, the VDS Verify :

- Flashes and decodes the QR Code
- Retrieves electronic signature certificates from a Trusted List issued by [ANTS](https://ants.gouv.fr/)
- Checks the validity of the electronic signature certificate (validity date and revocation)
- Verifies the CEV's electronic signature.
- Displays decoded data and electronic signature information

## Are personal data stored?

The VDS to decode is transmitted to our decoding API which performs the operations detailed above and transmits the result and the decoded data. This API processes this data in memory and no information is stored in any form. The API does not generate any logs. The VDS Verify mobile app keeps a local history file containing the decoded VDS.
