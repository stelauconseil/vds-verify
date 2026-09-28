---
layout: faq
lang: en
locale: en_US
alt_url: /faq-fr.html
title: Frequently asked questions
description: "VDS Verify FAQ: what a Visible Digital Seal (VDS) or 2D-Doc is, supported documents, how signature verification works, data privacy."
faq:
  - q: What is a Visible Digital Seal (VDS)?
    a: |
      A Visible Digital Seal (VDS, in French *Cachet Électronique Visible* or CEV) is a 2D code (Datamatrix or QR Code) printed on a document. It contains the document's key data and an electronic signature. Scanning it proves that the document was issued by the stated authority and that its data has not been tampered with.

      The main formats are the French **2D-Doc** from [ANTS](https://ants.gouv.fr/nos-missions/les-solutions-numeriques/2d-doc), the French **AFNOR XP Z42-105** standard and the international **ISO 22376:2023** standard.
  - q: What types of VDS are supported?
    a: |
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
  - q: How do I verify a France Identité identity proof?
    a: |
      Open VDS Verify and scan the 2D code printed on the identity proof. The app verifies the seal's electronic signature and displays the proof's data (names, date of birth, validity period, recipient). If the displayed data matches the document and the status is "Valid VDS", the proof is authentic.
  - q: How does VDS verification work?
    a: |
      To decode and verify a VDS, VDS Verify:

      1. Scans and decodes the Datamatrix or QR Code;
      2. Retrieves electronic signature certificates from a Trusted List issued by [ANTS](https://ants.gouv.fr/);
      3. Checks the validity of the signing certificate (validity dates and revocation);
      4. Verifies the VDS electronic signature;
      5. Displays the decoded data and electronic signature information.
  - q: Is VDS Verify free?
    a: |
      Yes. VDS Verify is free, with no account and no ads, on [iPhone](https://apps.apple.com/app/vds-verify/id6463440128) and [Android](https://play.google.com/store/apps/details?id=com.stelau.vdsverify).
  - q: Is personal data stored?
    a: |
      The VDS to decode is sent to our decoding API, which performs the operations above and returns the result and decoded data. The API processes this data in memory: nothing is stored in any form and the API generates no logs.

      The VDS Verify mobile app keeps a local history, on your phone only, containing the decoding results.
  - q: Who can issue VDS?
    a: |
      VDS Verify is built on Stelau's VDS creation, encoding and signing API, used in production by the French Ministry of the Interior for [France Identité](https://france-identite.gouv.fr/justificatif/). To add VDS to your own documents, [contact us](mailto:contact@stelau.com).
---
