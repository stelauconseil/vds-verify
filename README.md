<h1 align="center">
  VDS Verify<br />
</h1>
<p align="center"><a href="https://vds-verify.stelau.com"> 
<img src="https://img.shields.io/badge/HOMEPAGE-gray?style=for-the-badge"></a>&nbsp;</p>

Visible Digital Seal Reader is an app that allows you to read and verify the information contained in a VDS (Visible Digital Seal). It sends the QR code or datamatrix to our API to read, decode, verify the information and display it in a human readable format.
Data is not stored in any way, not even temporarily.

It can decode:

- VDS/CEV according to the [ISO 22376:2023](https://www.iso.org/fr/standard/50278.html)
- VDS/CEV according to the [AFNOR xp-z42105](https://www.boutique.afnor.org/fr-fr/norme/xp-z42105/specifications-relatives-a-la-mise-en-oeuvre-du-cachet-electronique-visible/fa199910/238577) specification
- 2D-DOC according to the [ANTS 2D-DOC](https://ants.gouv.fr/nos-missions/les-solutions-numeriques/2d-doc) specification

The App works on iOS and Android and is built using [Expo](https://expo.dev/). It uses our VDS Verify API hosted on [Clever Cloud](https://www.clever-cloud.com) in Paris, France to decode and verify the VDS.

# ⚙️ Setup

Update the API URL (environment variable) to point to the VDS verify server.

# ✍️ To start

```sh
yarn
yarn start
```

# To build

```sh
eas build --platform ios
eas build --platform android
eas submit
```

# ⚠️ License

`VDS Verify` is free and open-source software licensed under the [Apache 2.0 License](https://github.com/stelauconseil/vds-verify/blob/main/LICENSE).
