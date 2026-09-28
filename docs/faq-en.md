---
lang: en
alt_url: /faq-fr.html
title: Frequently asked questions
---

# Frequently asked questions

<details open markdown="1">
<summary>What types of VDS are supported?</summary>

VDS Verify decodes and verifies:

- **Every 2D-Doc**, including those printed on:
  - French national identity card
  - Restricted information statement (RIR)
  - Secure driving entitlement certificate (ADCS)
  - Crit'Air sticker
  - Energy bills (EDF for example)
  - Phone bills (Free for example)
  - … and any other document compliant with the [2D-Doc](https://ants.gouv.fr/nos-missions/les-solutions-numeriques/2d-doc) standard
- **Every VDS compliant with AFNOR XP Z42-105**, including those printed on:
  - The single-use identity proof of [France Identité](https://france-identite.gouv.fr/justificatif/)
  - The certified digital identity request of [France Identité](https://france-identite.gouv.fr/identite-numerique-certifiee/)
- **Every VDS compliant with ISO 22376:2023**, including those printed on:
  - [French recreational motor boat licence](https://www.mer.gouv.fr/le-permis-plaisance-permis-de-conduire-les-bateaux-de-plaisance-moteur#summary-target-0)

</details>

<details markdown="1">
<summary>How does VDS verification work?</summary>

To decode and verify a VDS, VDS Verify:

1. Scans and decodes the Datamatrix or QR Code;
2. Retrieves electronic signature certificates from a Trusted List issued by [ANTS](https://ants.gouv.fr/);
3. Checks the validity of the signing certificate (validity dates and revocation);
4. Verifies the VDS electronic signature;
5. Displays the decoded data and electronic signature information.

</details>

<details markdown="1">
<summary>Is personal data stored?</summary>

The VDS to decode is sent to our decoding API, which performs the operations above and returns the result and decoded data. The API processes this data in memory: nothing is stored in any form and the API generates no logs.

The VDS Verify mobile app keeps a local history, on your phone only, containing the decoding results.

</details>

<details markdown="1">
<summary>Who can issue VDS?</summary>

VDS Verify is built on our VDS creation, encoding and signing API, used in production by the French Ministry of the Interior for [France Identité](https://france-identite.gouv.fr/justificatif/). To add VDS to your own documents, [contact us](mailto:{{ site.contact_email }}).

</details>
