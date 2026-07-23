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

## Modifier la carte

Toutes les informations importantes de la carte sont dans `js/shared.js`.
Le plus souvent, il faut modifier ces zones :

- `const menu = [...]` : pizzas, boissons, descriptions, catégories et prix.
- `const menuImages = {...}` : image utilisée pour chaque pizza ou boisson.
- `const featuredPizza = {...}` : pizza du moment et popup d'accueil.
- `const extras = [...]` : liste des suppléments disponibles.
- `const config = {...}` : prix des suppléments et prix d'une modification.

Après une modification, enregistrer le fichier puis recharger `index.html` dans
le navigateur.

### Enlever la pizza du moment

Dans `js/shared.js`, chercher :

```js
const featuredPizza = {
  // Pour désactiver la popup, commente seulement la ligne pizzaId ci-dessous.
  pizzaId: "margarita",
  category: "Pizza du moment",
  badge: "Pizza du moment",
  title: "La pizza du moment",
  note: "Une pizza mise en avant pour le moment.",
  disableHamOption: true,
};
```

Pour désactiver la pizza du moment, commenter seulement la ligne `pizzaId` :

```js
const featuredPizza = {
  // pizzaId: "margarita",
  category: "Pizza du moment",
  badge: "Pizza du moment",
  title: "La pizza du moment",
  note: "Une pizza mise en avant pour le moment.",
  disableHamOption: true,
};
```

Quand `pizzaId` est commenté :

- la popup d'accueil ne s'affiche plus ;
- la catégorie `Pizza du moment` n'apparaît plus dans la carte.

### Changer la pizza du moment

Dans `featuredPizza`, remplacer l'id de `pizzaId` par l'id d'une pizza existante
dans le tableau `menu`.

Exemple :

```js
pizzaId: "kebab",
```

Pour changer le texte de la popup :

- `category` : nom de la catégorie affichée dans la carte ;
- `badge` : petit badge sur l'image de la popup ;
- `title` : grand titre de la popup ;
- `note` : phrase mise en avant dans la popup.
- `disableHamOption` : mettre `true` pour enlever le choix avec/sans jambon
  quand cette pizza est la pizza du moment.

### Modifier les ingrédients d'une pizza

Dans `js/shared.js`, chercher la pizza dans le tableau `menu`, puis modifier
`description`.

Exemple :

```js
{
  id: "regina",
  name: "Régina",
  category: "Les classiques",
  description: "Tomate, jambon, champignons, emmental, olives.",
  prices: { small: 12.9, large: 14.9 },
  image: images.classic,
  type: "pizza",
},
```

La description est le texte affiché sur la carte, dans la popup et dans la pizza
du moment si cette pizza est mise en avant.

### Modifier les prix

Dans chaque pizza, changer `prices`.

Exemple pour une pizza avec deux tailles :

```js
prices: { small: 12.9, large: 14.9 },
```

- `small` : petite pizza 26 cm ;
- `large` : grande pizza 33 cm.

Exemple pour un article avec un prix unique, comme une boisson :

```js
prices: { single: 3.5 },
```

Les prix sont écrits avec un point, pas une virgule : `13.9`, pas `13,9`.

### Ajouter une pizza à la carte

Dans `js/shared.js`, ajouter un nouveau bloc dans le tableau `menu`.
Chaque pizza doit avoir un `id` unique, sans espace ni accent.

Exemple :

```js
{
  id: "nouvelle-pizza",
  name: "Nouvelle Pizza",
  category: "Les spéciales",
  description: "Tomate, emmental, champignons, oignons, olives.",
  prices: { small: 12.9, large: 15.9 },
  image: images.special,
  type: "pizza",
},
```

Pour lui mettre une photo locale, ajouter ensuite son image dans `menuImages` :

```js
"nouvelle-pizza": "assets/photos/nouvelle-pizza.png",
```

L'image doit être placée dans le dossier `assets/photos/`.

### Ajouter ou modifier les suppléments

Dans `js/shared.js`, chercher :

```js
const extras = [
  { id: "emmental", name: "Emmental" },
  { id: "mozzarella", name: "Mozzarella" },
];
```

Ajouter une ligne pour un nouveau supplément :

```js
{ id: "poitrine", name: "Poitrine" },
```

Le `name` est affiché au client. Le `id` doit être unique, sans espace ni accent.

### Modifier le prix des suppléments ou des modifications

Dans `js/shared.js`, chercher `const config`.

```js
const config = {
  currency: "EUR",
  modificationPrice: 0.2,
  supplementPrices: {
    small: 1,
    large: 1.5,
    single: 1,
  },
};
```

- `modificationPrice` : prix ajouté quand le client écrit une modification ;
- `supplementPrices.small` : supplément pour petite pizza ;
- `supplementPrices.large` : supplément pour grande pizza.

### Cas spécial : Margarita avec ou sans jambon

La Margarita a une option gratuite spéciale :

```js
hamOption: true,
```

Cette ligne affiche le choix `Avec jambon` / `Sans jambon` uniquement pour cette
pizza. Ce choix ne change pas le prix.

Si la Margarita est utilisée comme pizza du moment avec `disableHamOption: true`,
ce choix est masqué.

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

### Estimation d'arrivée dynamique (façon Uber Eats)

Sur la page de suivi, le client peut **activer sa position**. L'estimation
d'arrivée est alors recalculée en continu :

- itinéraire routier réel entre le livreur et le client via OSRM
  (`router.project-osrm.org`, gratuit et sans clé) ;
- le tracé de la route s'affiche sur la carte, avec la **distance restante** ;
- l'heure d'arrivée et le temps restant se mettent à jour à chaque déplacement du
  livreur (recalcul limité à 1 fois / 8 s).

Si le routage échoue, une estimation « à vol d'oiseau » (distance × 1,3 à ~23
km/h) prend le relais. Si le client refuse la géolocalisation, l'estimation
retombe sur la durée fixe saisie par le livreur au départ. Aucune donnée de
position du client n'est enregistrée : le calcul se fait dans son navigateur.

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
