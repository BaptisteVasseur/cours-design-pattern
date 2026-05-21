# Split Front / Back

> *"Séparer l'interface utilisateur de la logique métier."*

---

## Vue d'ensemble

![Architecture Back-end / Front-end](https://www.next-decision.fr/images/structure_nj/schema-archi-app.jpg)

L'architecture **Split Front/Back** consiste à séparer physiquement :
- Le **Back-end** : API, logique métier, accès données
- Le **Front-end** : interface utilisateur, interactions, rendu

Les deux communiquent via une **API** (REST, GraphQL, gRPC...).

---

## Avant le split : le rendu serveur

Dans une architecture traditionnelle (monolithe MVC), le serveur génère le HTML :

```
Navigateur ──────────────────────────────► Serveur
           GET /products

Serveur ──────────────────────────────────► Navigateur
           <html>
             <h1>Produits</h1>
             <ul>...</ul>
           </html>

→ Chaque page = 1 requête = 1 rendu côté serveur
→ Le serveur connaît l'état de l'UI
```

**Frameworks concernés** : Symfony Twig, Laravel Blade, Ruby on Rails ERB, JSP...

---

## Après le split : le rendu client (SPA)

```
                    ┌──────────────────────────────┐
                    │         BACK-END              │
                    │                               │
  Navigateur        │  ┌─────────────────────────┐  │
  ┌──────────┐      │  │   API REST / GraphQL    │  │      ┌──────────┐
  │          │─────►│  │                         │  │─────►│          │
  │  React   │◄─────│  │  Controllers            │  │◄─────│    DB    │
  │  Vue.js  │      │  │  Services               │  │      └──────────┘
  │  Angular │ JSON │  │  Repositories           │  │
  │          │      │  └─────────────────────────┘  │
  └──────────┘      └──────────────────────────────┘
  
  FRONT-END                   BACK-END
  (navigateur)                (serveur)
```

---

## Les différents modes de rendu

### CSR — Client-Side Rendering (SPA pure)

Le HTML est généré dans le navigateur par JavaScript.

```
1. Navigateur charge index.html (vide)
2. Navigateur charge bundle.js (React/Vue/Angular)
3. JS exécute, fetch les données via API
4. JS génère le HTML et l'insère dans le DOM

Avantages :
  ✅ Interface ultra-réactive (pas de rechargement de page)
  ✅ Séparation totale front/back
  ✅ Le back peut servir plusieurs clients (web, mobile, IoT)

Inconvénients :
  ❌ SEO difficile (les moteurs de recherche voient du HTML vide)
  ❌ Temps de premier affichage plus long (TTI)
  ❌ Dépendant de JS (accessibilité)
```

### SSR — Server-Side Rendering

Le HTML est généré côté serveur, mais la page s'hydrate ensuite en SPA.

```
1. Navigateur demande la page
2. Serveur Node.js exécute React/Vue et génère le HTML complet
3. Navigateur affiche le HTML immédiatement (First Contentful Paint ⚡)
4. JS se charge et "hydrate" la page (la rend interactive)

Exemples : Next.js (React), Nuxt.js (Vue), SvelteKit
```

### SSG — Static Site Generation

Les pages sont générées **au moment du build**, pas à la demande.

```
Build time :  React → HTML statique (des milliers de fichiers .html)
Runtime :     CDN sert directement les fichiers statiques

Parfait pour : blogs, documentation, sites marketing
Exemples : Gatsby, Next.js (mode static), Astro
```

---

## L'API : le contrat entre front et back

### REST

```
GET    /api/products          → Liste des produits
GET    /api/products/42       → Produit #42
POST   /api/products          → Créer un produit
PUT    /api/products/42       → Remplacer le produit #42
PATCH  /api/products/42       → Modifier partiellement
DELETE /api/products/42       → Supprimer

Format : JSON
Stateless : chaque requête est indépendante
```

### GraphQL

```graphql
# Le client demande exactement ce dont il a besoin
query {
  product(id: 42) {
    name
    price
    category {
      name
    }
  }
}

Avantages :
  ✅ Pas de over-fetching (on prend exactement ce qu'on veut)
  ✅ Pas de under-fetching (tout en une requête)
  ✅ Fortement typé (schema)

Inconvénients :
  ❌ Complexité accrue côté back
  ❌ Caching plus difficile qu'avec REST
```

---

## Avantages du split front/back

| Avantage | Détail |
|----------|--------|
| **Équipes indépendantes** | L'équipe front et l'équipe back travaillent en parallèle |
| **Multi-client** | La même API sert l'app web, mobile, partenaires |
| **Scalabilité indépendante** | Front sur CDN, back sur des serveurs dédiés |
| **Technologie libre** | React aujourd'hui, Vue demain, sans toucher au back |
| **Sécurité** | La logique métier n'est pas exposée dans le client |

---

## Pièges courants

### Le "leaky back-end"
```
❌ Le back renvoie TOUTES les données de la DB
   GET /users → { id, email, password, salt, internal_notes, ... }

✅ Le back expose uniquement ce dont le front a besoin
   GET /users/me → { id, email, displayName, avatar }
```

### Le "logique métier dans le front"
```
❌ Le front calcule le prix avec les remises
   const price = product.price * (1 - user.discount)

✅ Le back calcule et expose le prix final
   GET /products/42/price → { price: 89.99, originalPrice: 99.99 }
```

### Le "CORS hell"
```
Navigateur bloque les requêtes cross-origin par sécurité.
Solution : configurer les headers CORS côté back correctement.
Jamais de Access-Control-Allow-Origin: * en production !
```

---

## Quand utiliser le split front/back ?

```
✅ Utiliser quand :
  • On a besoin d'une expérience utilisateur très interactive (SPA)
  • On veut servir plusieurs types de clients (web + mobile)
  • Les équipes front et back sont séparées
  • Le SEO n'est pas critique (dashboards, apps B2B)

🤔 Reconsidérer (rendu serveur) quand :
  • Le SEO est important (e-commerce, blog, site vitrine)
  • L'équipe est petite et la complexité n'est pas justifiée
  • Le contenu change peu (SSG est peut-être suffisant)
```

---

→ [Suite : Architecture en Couches](./04-architecture-en-couche.md)
