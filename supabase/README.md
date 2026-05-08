# Supabase

Projet Supabase : `mqaxjswqchyjgtqlcwxw`

## Installation CLI

Le CLI Supabase n'est pas installé sur cette machine. Après installation :

```powershell
supabase login
supabase init
supabase link --project-ref mqaxjswqchyjgtqlcwxw
supabase db push
```

La migration à appliquer est dans `supabase/migrations/202605060001_create_orders.sql`.

## Auth pizzeria

Pour que l'espace pizzeria lise et modifie les commandes Supabase, créer un
utilisateur dans Supabase Auth, puis définir son mot de passe dans Supabase. Sur
`pizzeria.html`, se connecter avec l'email du compte Supabase.

Ajouter ce metadata au compte pizzeria :

```json
{ "role": "pizzeria" }
```

Les clients peuvent créer des commandes sans compte. La lecture, la modification
et la suppression sont réservées aux comptes authentifiés dont
`app_metadata.role` vaut `pizzeria`.

Après création du compte, désactiver les inscriptions publiques dans les
paramètres Auth Supabase.
