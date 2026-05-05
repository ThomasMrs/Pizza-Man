# Pizza-Man

Site statique GitHub Pages pour prendre des commandes de pizzas et gérer une
liste de préparation côté pizzeria.

## Fichiers

- `index.html` : interface client responsive, sans compte.
- `pizzeria.html` : interface pizzeria avec connexion simple.
- `js/shared.js` : carte des pizzas, suppléments, prix et helpers de commande.
- `js/client.js` : panier, personnalisation, message et lien de commande.
- `js/admin.js` : import des liens de commande, statuts et stockage local.
- `styles.css` : interface mobile et ordinateur.

## Accès pizzeria

Identifiant par défaut : `pizzeria`

Mot de passe par défaut : `pizza2026`

Ces valeurs se changent dans `js/shared.js`.

## Fonctionnement des commandes

Le client ajoute des pizzas, choisit petite ou grande taille, ajoute des
suppléments et peut préciser une modification. Le site génère ensuite :

- un message à copier ;
- un lien WhatsApp ;
- un lien SMS ;
- un lien pizzeria.

Le lien pizzeria ouvre `pizzeria.html` avec la commande préremplie. Après
connexion, il suffit de cliquer sur `Ajouter` pour l’enregistrer dans la liste.

## Tester en local

Ouvrir `index.html` dans un navigateur pour tester l’interface client. Ouvrir
`pizzeria.html` pour tester l’interface pizzeria.

Pour publier sur GitHub Pages : `Settings` -> `Pages`, puis sélectionner la
branche `main` et le dossier racine.

## Important pour GitHub Pages

GitHub Pages héberge uniquement des fichiers statiques. La version actuelle
utilise donc `localStorage` comme stockage local dans le navigateur de la
pizzeria. Pour une vraie base de données partagée entre plusieurs appareils, il
faudra brancher un service externe comme Supabase, Firebase ou un petit backend.

## Mise à jour de la carte

Quand la vraie liste des pizzas, compositions et prix est prête, modifier le
tableau `menu` dans `js/shared.js`. Chaque pizza contient :

- `name` : nom affiché ;
- `description` : composition ;
- `prices.small` : prix petite pizza ;
- `prices.large` : prix grande pizza ;
- `image` : URL de l’image.
