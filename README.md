<h1 align="center">
  VDS Reader<br />
</h1>
<p align="center"><a href="https://www.stelau.com"> 
<img src="https://img.shields.io/badge/HOMEPAGE-gray?style=for-the-badge"></a>&nbsp;</p>

Visible Digital Seal Reader is a web application that allows you to read and verify the information contained in a VDS (Visible Digital Seal). It uses our API to read and verify the information and display it in a human readable format.
Data is not stored in any way, not even temporarily.

It can decode

- VDS/CEV according to the [AFNOR xp-z42105 specification](https://www.boutique.afnor.org/fr-fr/norme/xp-z42105/specifications-relatives-a-la-mise-en-oeuvre-du-cachet-electronique-visible/fa199910/238577)
- 2D-DOC according to the [ANTS 2D-DOC specification](https://ants.gouv.fr/nos-missions/les-solutions-numeriques/2d-doc)

# ⚙️ Setup

Update the API URL in the fetch request in App.js to point to the local server.

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
