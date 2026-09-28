---
lang: en
locale: en_US
alt_url: /verification-2d-doc.html
title: "2D-Doc verification: how to verify a 2D-Doc for free"
description: "Verify a French 2D-Doc or Visible Digital Seal (proof of address, tax notice, ID card, France Identité) for free, with the technology used by France Titres (ANTS) and France Identité."
---

# 2D-Doc verification: check a document's authenticity

The **2D-Doc** is the signed Datamatrix barcode printed on French proofs of address, tax notices, energy and phone bills, national ID cards and many other official documents. **Verifying a 2D-Doc** tells you within seconds whether a document was really issued by the stated organisation and whether its data has been tampered with.

## Technology proven at national scale

VDS Verify is published by [Stelau](https://www.stelau.com). The French State uses Stelau's Visible Digital Seal (VDS) technology in production:

- **France Titres (ANTS)**: the [official 2D-Doc verification service](https://web.2ddoc.services.ants.gouv.fr/) uses our API.
- **France Identité**: our verification SDK ships in the [France Identité](https://france-identite.gouv.fr/) app, used by more than 5 million people, and France Identité uses our API to issue the seals on its [identity proofs](https://france-identite.gouv.fr/justificatif/).

## How to verify a 2D-Doc for free

1. **Download VDS Verify**. It is free and needs no account, on [iPhone]({{ site.appstore_url }}) or [Android]({{ site.playstore_url }}).
2. **Scan the 2D-Doc code** on the document, printed on paper or shown on a screen.
3. **Read the result**: the app shows whether the signature is valid, along with the signed data and the certificate details.
4. **Compare** the decoded data with what is printed on the document. Any difference means the document was falsified.

## What a 2D-Doc check verifies

A 2D-Doc holds the document's key data (name, address, amount, date…) and the issuer's **electronic signature**. Verification means:

- decoding the Datamatrix and its header (version, certificate authority, certificate, document type);
- fetching the issuer's certificate from the **ANTS Trusted Service List (TSL)**;
- checking the certificate's validity (dates, revocation);
- cryptographically verifying the signature over the data.

If any of these steps fails, the document should not be considered authentic.

## Documents carrying a 2D-Doc or VDS

- Proofs of address: energy (electricity, gas), phone and internet bills
- Income tax notices
- French national ID card
- France Identité identity proof
- Restricted information statement (RIR) and driving entitlement certificate (ADCS)
- Recreational boat licence
- Crit'Air sticker

## 2D-Doc, VDS, AFNOR and ISO 22376: the standards

The **2D-Doc** was created by ANTS (now France Titres) and standardised by AFNOR (XP Z42-101 to 104). It evolved into the **Visible Digital Seal** defined by **AFNOR XP Z42-105**, then by the international standard **ISO 22376:2023**. VDS Verify supports all three formats.

## 2D-Doc verification for businesses: API and SDK

To verify 2D-Docs at scale (KYC, rental applications, lending, HR) or to **issue and sign your own seals**, Stelau offers:

- an **API** to create, sign, decode and verify VDS, compliant with AFNOR XP Z42-105 and ISO 22376:2023, HSM and qualified certificate ready;
- a **mobile verification SDK**, already deployed to more than 5 million users through France Identité.

[Contact us](mailto:{{ site.contact_email }}?subject=2D-Doc%20API%20%2F%20SDK) for a demo.

## Frequently asked questions

See the [FAQ]({{ '/faq-en.html' | relative_url }}) to learn more about VDS, supported documents and data privacy.
