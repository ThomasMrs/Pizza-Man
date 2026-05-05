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
utilisateur dans Supabase Auth, puis se connecter avec son email et son mot de
passe sur `pizzeria.html`.

Les clients peuvent créer des commandes sans compte. La lecture, la modification
et la suppression sont réservées aux utilisateurs authentifiés.
