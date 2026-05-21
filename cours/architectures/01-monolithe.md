# Le Monolithe

> *"Avant de comprendre pourquoi on s'en éloigne, il faut comprendre pourquoi on l'utilise."*

---

## Qu'est-ce qu'un monolithe ?

Un **monolithe** est une application où **tout le code est déployé comme une seule unité**. La couche de présentation, la logique métier et l'accès aux données vivent dans le même processus, souvent dans le même dépôt git, et sont déployés ensemble.

```
┌────────────────────────────────────────────┐
│              APPLICATION MONOLITHE          │
│                                            │
│   ┌──────────────────────────────────┐     │
│   │      Couche Présentation         │     │
│   │   (Controllers, Views, Routes)   │     │
│   └──────────────┬───────────────────┘     │
│                  │                         │
│   ┌──────────────▼───────────────────┐     │
│   │       Couche Métier              │     │
│   │  (Services, Domain, Business)    │     │
│   └──────────────┬───────────────────┘     │
│                  │                         │
│   ┌──────────────▼───────────────────┐     │
│   │      Couche Données              │     │
│   │  (Repositories, ORM, Queries)    │     │
│   └──────────────┬───────────────────┘     │
│                  │                         │
└──────────────────┼─────────────────────────┘
                   │
          ┌────────▼────────┐
          │   Base de données│
          └─────────────────┘
```

---

## Les deux types de monolithes

### Monolithe modulaire (le bon)

Le code est organisé en **modules ou namespaces** bien séparés. Les dépendances entre modules sont explicites et maîtrisées.

```
src/
├── Facturation/
│   ├── Controller/
│   ├── Service/
│   └── Repository/
├── Catalogue/
│   ├── Controller/
│   ├── Service/
│   └── Repository/
└── Utilisateurs/
    ├── Controller/
    ├── Service/
    └── Repository/
```

### Monolithe spaghetti (le mauvais)

Pas de structure claire. La logique métier est dans les vues, les contrôleurs font tout, les entités sont partout. C'est le **"Big Ball of Mud"**.

---

## Avantages du monolithe

| Avantage | Pourquoi c'est important |
|----------|------------------------|
| **Simplicité de développement** | Un seul projet à lancer, pas de coordination inter-services |
| **Facilité de débogage** | Une seule stack trace, tout est dans le même processus |
| **Transactions simples** | ACID garanti sans saga ni 2PC |
| **Déploiement simple** | Une seule unité à déployer, pas d'orchestration |
| **Refactoring facile** | L'IDE voit tout le code, les renames sont globaux |
| **Moins de latence** | Les appels internes sont des appels de fonction, pas HTTP |

---

## Inconvénients du monolithe

| Inconvénient | Conséquence |
|-------------|-------------|
| **Couplage fort** (si mal structuré) | Un changement peut casser n'importe quoi |
| **Scalabilité verticale seulement** | On doit scaler TOUT l'app, même si seul 1 module est sous charge |
| **Déploiement tout-ou-rien** | Un bug dans un module = tout le monde redéploie |
| **Stack technique figée** | Difficile de migrer un module vers un autre langage/framework |
| **Équipes qui se marchent dessus** | Conflits de merge, couplage entre équipes |

---

## Quand utiliser le monolithe ?

```
✅ Utiliser le monolithe quand :

  • L'équipe est petite (< 5-10 devs)
  • Le domaine métier n'est pas encore clairement défini
  • La startup est en phase de découverte produit
  • La complexité opérationnelle des microservices n'est pas justifiée
  • C'est votre première version (MVP)

❌ Reconsidérer quand :

  • Le temps de build/test dépasse 10-15 minutes
  • Les équipes se bloquent mutuellement sur des déploiements
  • Un seul module a des besoins de scalabilité très différents
  • La base de code est devenue impossible à comprendre
```

---

## L'évolution naturelle

```
Startup (1-3 devs)      Scale-up (5-15 devs)     Enterprise (15+ devs)
────────────────────     ───────────────────────   ──────────────────────
  Monolithe simple   →   Monolithe modulaire    →   Microservices (si besoin)
                                                     (ou monolithe distribué ⚠️)
```

> **Conseil de Lead Tech** : Commencez toujours par un monolithe modulaire bien structuré. Les microservices sont une *optimisation*, pas un point de départ.
> Martin Fowler appelle ça le **"Monolith First"** pattern.

---

## Exemple concret : e-commerce

Un monolithe Symfony classique pour un e-commerce :

```
src/
├── Controller/
│   ├── ProductController.php      ← Catalogue
│   ├── OrderController.php        ← Commandes
│   └── UserController.php         ← Utilisateurs
│
├── Entity/
│   ├── Product.php
│   ├── Order.php
│   └── User.php
│
├── Repository/
│   ├── ProductRepository.php
│   ├── OrderRepository.php
│   └── UserRepository.php
│
└── Service/
    ├── OrderService.php           ← Logique métier commandes
    ├── PaymentService.php         ← Logique métier paiement
    └── EmailService.php           ← Notifications
```

Tout ça tourne dans **un seul processus PHP**, se connecte à **une seule base de données**, et se déploie **en un seul `git push`**.

---

## À retenir

> Un monolithe bien conçu vaut mieux que des microservices mal conçus.
> Le monolithe modulaire est souvent le meilleur choix jusqu'à preuve du contraire.

---

→ [Suite : Le Monolithe Distribué (l'anti-pattern)](./02-monolithe-distribue.md)
