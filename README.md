# Pizza-Man

Site statique GitHub Pages pour Pizza'Man St Jean, cuisson au feu de bois depuis
1996. Le site permet à un client de composer une commande et de l'envoyer par
SMS à la pizzeria.

## Informations intégrées

- Adresse : 8 Route Nationale 115, 66490 Saint-Jean-Pla-de-Corts.
- Horaires : mardi au samedi, 18h45 à 21h30.
- Commandes par SMS : `06-46-57-63-69`.
- Facebook : <https://www.facebook.com/pizzaman.stjean/?ref=page_internal>
- Google : <https://share.google/MiNwfMVDMd9wwK8vd>
- Livraison : Le Boulou, Céret, Maureillas, St Jean.
- Frais de livraison : `4 EUR` par commande.
- Livraison à partir de 2 pizzas.

## Fichiers

- `index.html` : interface client responsive.
- `js/shared.js` : carte complète, suppléments, prix et helpers de commande.
- `js/client.js` : panier, personnalisation, génération du message SMS.
- `styles.css` : styles desktop et mobile.
- `assets/pizzaman-logo-clean.png` : logo découpé utilisé par le site.
- `assets/favicon.png` : logo de l'onglet du navigateur.

## Fonctionnement des commandes

Le client ajoute des pizzas, choisit petite ou grande taille, déploie les
suppléments et peut préciser une modification. Le site calcule :

- supplément petite pizza : `1 EUR` ;
- supplément grande pizza : `1,50 EUR` ;
- modification : `0,50 EUR` ;
- frais de livraison : `4 EUR` si le client choisit la livraison.

Le client renseigne une heure souhaitée (par tranche de 15 min entre 18h45 et
21h30). Les créneaux déjà passés sont automatiquement masqués. Quand il valide,
son téléphone ouvre l'application SMS avec le message préremplie pour la
pizzeria.

## Tester en local

Ouvrir `index.html` dans un navigateur. Aucun backend n'est requis.

## Mise à jour de la carte

Quand la vraie liste des pizzas, compositions et prix est prête, modifier le
tableau `menu` dans `js/shared.js`. Chaque article contient :

- `name` : nom affiché ;
- `category` : catégorie de la carte ;
- `description` : composition ;
- `prices.small` : prix petite pizza ;
- `prices.large` : prix grande pizza ;
- `prices.single` : prix unique, pour les boissons ;
- `image` : URL de l'image.

## Publier sur GitHub Pages

`Settings` -> `Pages`, puis sélectionner la branche `main` et le dossier racine.
