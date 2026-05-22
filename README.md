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
  note: "Disponible avec ou sans jambon, sans supplément.",
};
```

Pour désactiver la pizza du moment, commenter seulement la ligne `pizzaId` :

```js
const featuredPizza = {
  // pizzaId: "margarita",
  category: "Pizza du moment",
  badge: "Pizza du moment",
  title: "La pizza du moment",
  note: "Disponible avec ou sans jambon, sans supplément.",
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

## Publier sur GitHub Pages

`Settings` -> `Pages`, puis sélectionner la branche `main` et le dossier racine.
