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
utilisateur Supabase Auth avec l'email `christian@pizza.com`, puis définir son
mot de passe dans Supabase.

Les clients peuvent créer des commandes sans compte. La lecture, la modification
et la suppression sont réservées au compte authentifié `christian@pizza.com`.

Après création du compte, désactiver les inscriptions publiques dans les
paramètres Auth Supabase.
