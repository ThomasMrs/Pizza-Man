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
- `livreur.html` : espace livreur (partage de position + message automatique au client).
- `suivi.html` : page de suivi en direct pour le client (carte).
- `js/shared.js` : carte complète, suppléments, prix et helpers de commande.
- `js/client.js` : panier, personnalisation, génération du message SMS.
- `js/tracking.js` : configuration Supabase + fonctions de suivi de livraison.
- `js/livreur.js` : logique de l'espace livreur (GPS, message client).
- `js/suivi.js` : logique de la carte de suivi côté client.
- `sql/supabase-setup.sql` : script à exécuter une fois dans Supabase.
- `styles.css` : styles desktop et mobile.
- `assets/pizzaman-logo-clean.png` : logo découpé utilisé par le site.
- `assets/favicon.png` : logo de l'onglet du navigateur.

## Fonctionnement des commandes

Le client ajoute des pizzas, choisit petite ou grande taille, déploie les
suppléments et peut préciser une modification. Le site calcule :

- supplément petite pizza : `1 EUR` ;
- supplément grande pizza : `1,50 EUR` ;
- modification : `0,20 EUR` ;
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

## Suivi de livraison en temps réel

Le site permet au livreur de prévenir le client de son départ et de partager sa
position GPS en direct. Le client suit le livreur sur une carte, sans installer
d'application.

### Comment ça marche

1. **Le livreur** ouvre `livreur.html` (lien « Espace livreur » en bas de la page
   d'accueil), renseigne le nom du client, son téléphone et la durée estimée,
   puis appuie sur « Je pars ». Le téléphone demande l'autorisation de partager
   la position ; il faut l'accepter.
2. Le site crée la livraison dans la base et génère un **message prêt à envoyer**
   (SMS ou WhatsApp) contenant la durée estimée, un **lien de suivi en direct** et
   un lien Google Maps.
3. **Le client** ouvre le lien reçu (`suivi.html?id=...`) et voit le livreur se
   déplacer sur la carte, avec l'heure d'arrivée estimée qui se met à jour toute
   seule.
4. À l'arrivée, le livreur appuie sur « Je suis arrivé » (ou « Annuler »).

La position se rafraîchit via Supabase Realtime, avec un rafraîchissement
périodique (toutes les 5 s) en filet de sécurité. La carte utilise Leaflet +
OpenStreetMap (gratuit, sans clé d'API).

### Configuration Supabase (à faire une fois)

1. Dans le tableau de bord Supabase, ouvrir `SQL Editor`, coller le contenu de
   `sql/supabase-setup.sql` et cliquer sur `Run`. Cela crée la table
   `deliveries`, active la sécurité (RLS) et le temps réel.
2. Vérifier que l'URL et la clé publique dans `js/tracking.js` correspondent au
   projet (`Settings` -> `API` -> `Project URL` et `anon`/`publishable key`).

> La clé utilisée dans `js/tracking.js` est la clé **publique** (publishable) :
> elle est conçue pour être visible dans le navigateur. Ne jamais y mettre le mot
> de passe de la base ni la chaîne `postgresql://...` : cette connexion directe
> reste réservée à l'administration de la base.

### Note de sécurité

Le site n'a pas de compte livreur : n'importe qui connaissant l'URL de
`livreur.html` peut créer une livraison. Comme la pizzeria est petite et que le
lien de suivi contient un identifiant impossible à deviner, ce compromis est
acceptable. Pour durcir, ajouter une authentification livreur (Supabase Auth) et
restreindre les règles `insert`/`update` dans le script SQL.
