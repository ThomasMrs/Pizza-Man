# Pizza-Man

Site statique GitHub Pages pour Pizza'Man St Jean, cuisson au feu de bois depuis
1996. Le site permet de composer une commande client et de l'importer côté
pizzeria via un lien.

## Informations intégrées

- Adresse : 8 Route Nationale 115, 66490 Saint-Jean-Pla-de-Corts.
- Horaires : mardi au samedi, 17h à 21h30.
- Commandes par SMS : `06-46-57-63-69`.
- Facebook : <https://www.facebook.com/pizzaman.stjean/?ref=page_internal>
- Google : <https://share.google/MiNwfMVDMd9wwK8vd>
- Livraison : Le Boulou, Céret, Maureillas, St Jean.
- Frais de livraison : `4 EUR` par commande.
- Livraison à partir de 2 pizzas.

## Fichiers

- `index.html` : interface client responsive, sans compte.
- `pizzeria.html` : interface pizzeria avec connexion simple.
- `js/shared.js` : carte complète, suppléments, prix et helpers de commande.
- `js/supabase-client.js` : connexion Supabase pour enregistrer les commandes.
- `js/client.js` : panier, personnalisation, message et lien de commande.
- `js/admin.js` : import des liens de commande, statuts et lecture Supabase.
- `styles.css` : interface mobile et ordinateur.
- `assets/pizzaman-logo.png` : logo du site.
- `assets/favicon.png` : logo de l'onglet du navigateur.
- `supabase/migrations/202605060001_create_orders.sql` : table `orders` et règles RLS.

## Accès pizzeria

Identifiant par défaut : `pizzeria`

Mot de passe par défaut : `pizza2026`

Ces valeurs se changent dans `js/shared.js`.

Avec Supabase, l'accès recommandé est un utilisateur Supabase Auth. Créer un
utilisateur dans le dashboard Supabase, puis se connecter à l'espace pizzeria
avec son email et son mot de passe. L'accès local ci-dessus reste un secours
pour tester sans base distante.

## Fonctionnement des commandes

Le client ajoute des pizzas, choisit petite ou grande taille, ajoute des
suppléments et peut préciser une modification. Le site calcule aussi :

- supplément petite pizza : `1 EUR` ;
- supplément grande pizza : `1,50 EUR` ;
- modification : `0,50 EUR` ;
- frais de livraison : `4 EUR` si le client choisit la livraison.

Le site génère ensuite :

- un message à copier ;
- un lien WhatsApp ;
- un lien SMS ;
- un lien pizzeria.

Quand le client copie ou envoie le message, le site tente aussi d'enregistrer la
commande dans Supabase. Le lien pizzeria ouvre `pizzeria.html` avec la commande
préremplie. Après connexion, il suffit de cliquer sur `Ajouter` si la commande
n'apparaît pas déjà dans la liste.

## Supabase

URL configurée : `https://mqaxjswqchyjgtqlcwxw.supabase.co`

La clé publishable est configurée dans `js/supabase-client.js`. Ne pas mettre le
mot de passe PostgreSQL dans le code du site.

Le CLI Supabase n'est pas installé sur cette machine. Une fois installé, lancer :

```powershell
supabase login
supabase init
supabase link --project-ref mqaxjswqchyjgtqlcwxw
supabase db push
```

La migration active :

```text
supabase/migrations/202605060001_create_orders.sql
```

## Tester en local

Ouvrir `index.html` dans un navigateur pour tester l’interface client. Ouvrir
`pizzeria.html` pour tester l’interface pizzeria.

Pour publier sur GitHub Pages : `Settings` -> `Pages`, puis sélectionner la
branche `main` et le dossier racine.

## Important pour GitHub Pages

GitHub Pages héberge uniquement des fichiers statiques. La version actuelle
utilise Supabase pour une base partagée. Si Supabase n'est pas encore migré ou
connecté, le site garde un secours local avec `localStorage` dans le navigateur.

## Mise à jour de la carte

Quand la vraie liste des pizzas, compositions et prix est prête, modifier le
tableau `menu` dans `js/shared.js`. Chaque article contient :

- `name` : nom affiché ;
- `category` : catégorie de la carte ;
- `description` : composition ;
- `prices.small` : prix petite pizza ;
- `prices.large` : prix grande pizza ;
- `prices.single` : prix unique, pour les boissons ;
- `image` : URL de l’image.
