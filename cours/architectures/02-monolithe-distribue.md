# Le Monolithe Distribué

> *"Le pire des deux mondes."*

---

## Définition

Le **monolithe distribué** est ce qui arrive quand on **découpe un monolithe en plusieurs services** sans vraiment les rendre autonomes. On a créé plusieurs processus qui :

- **partagent toujours la même base de données**
- **sont fortement couplés entre eux** (appels HTTP synchrones en cascade)
- **doivent être déployés ensemble** pour ne pas casser

En résumé : on a pris toute la complexité des microservices **sans aucun de leurs bénéfices**.

---

## Schéma : Le piège du monolithe distribué

```
     ┌─────────────────────────────────────────────────────┐
     │                MONOLITHE DISTRIBUÉ                   │
     │                                                       │
     │  Service A ──HTTP──► Service B ──HTTP──► Service C   │
     │      │                    │                   │       │
     │      └────────────────────┴───────────────────┘       │
     │                           │                           │
     │                           ▼                           │
     │              ┌─────────────────────┐                  │
     │              │  BASE DE DONNÉES    │                  │
     │              │     PARTAGÉE        │                  │
     │              └─────────────────────┘                  │
     └─────────────────────────────────────────────────────┘

     ⚠️ Service A ne peut pas démarrer sans Service B
     ⚠️ Une migration DB impacte tous les services
     ⚠️ Un bug dans Service C fait tomber la cascade
```

---

## Comment on arrive là ?

C'est le résultat d'une **mauvaise découpe** :

### Erreur 1 : Découper par couche technique (pas par domaine)

```
❌ Mauvais découpage (technique) :
  
  service-controllers/   ← Tous les contrôleurs de l'app
  service-business/      ← Toute la logique métier
  service-data/          ← Tous les accès DB

  → Ces services doivent forcément se parler pour CHAQUE requête.
```

```
✅ Bon découpage (par domaine/capacité métier) :

  service-catalogue/     ← Tout ce qui concerne les produits
  service-commandes/     ← Tout ce qui concerne les commandes
  service-paiement/      ← Tout ce qui concerne la facturation
```

### Erreur 2 : Appels synchrones en chaîne

```
Client → Service A → Service B → Service C → DB

Si Service C met 500ms, la requête du client attend :
  500ms (C) + 100ms (B→C) + 100ms (A→B) + 100ms (client→A) = 800ms

Si Service C est down :
  Service A retourne une erreur
  Service B retourne une erreur
  → Cascade de pannes
```

### Erreur 3 : La base de données partagée

```
service-commandes/  ─────┐
service-stock/      ─────┤──► TABLE products ──► Une seule DB
service-catalogue/  ─────┘

Problème : si on veut refactorer la table products,
il faut coordonner 3 services simultanément.
```

---

## Comment le détecter ?

Posez-vous ces questions :

| Question | Si "Oui" → danger |
|----------|------------------|
| Plusieurs services partagent-ils la même DB ? | ⚠️ Couplage de données |
| Un déploiement nécessite-t-il de coordonner plusieurs services ? | ⚠️ Couplage de déploiement |
| Est-ce qu'une requête traverse systématiquement 3+ services ? | ⚠️ Couplage d'exécution |
| Est-ce qu'un service appelle directement les tables d'un autre service ? | ⚠️ Couplage de base de données |
| Avez-vous une "orchestration centrale" qui pilote tout ? | ⚠️ Possiblement God service |

---

## Comparaison des trois approches

```
┌─────────────────┬──────────────────┬───────────────────┐
│   Monolithe     │ Monolithe Dist.  │  Microservices    │
│                 │ (anti-pattern)   │  (bien faits)     │
├─────────────────┼──────────────────┼───────────────────┤
│ Déploiement     │ Complexe mais    │ Indépendant       │
│ simple          │ couplé           │                   │
├─────────────────┼──────────────────┼───────────────────┤
│ DB unifiée      │ DB partagée ⚠️  │ DB par service ✅ │
├─────────────────┼──────────────────┼───────────────────┤
│ Couplage fort   │ Couplage fort    │ Couplage faible   │
│ mais visible    │ ET distribué ⚠️ │                   │
├─────────────────┼──────────────────┼───────────────────┤
│ Simple à        │ Complexe à       │ Complexe à        │
│ déboguer        │ déboguer ⚠️     │ opérer            │
└─────────────────┴──────────────────┴───────────────────┘
```

---

## Comment s'en sortir ?

Si vous êtes dans cette situation, voici les étapes pour en sortir :

1. **Identifier les domaines** — Quelles sont les vraies capacités métier indépendantes ?
2. **Casser le couplage de données** — Chaque service devient propriétaire de ses données
3. **Remplacer les appels synchrones par des événements** — `CommandePassée` au lieu de `POST /commandes`
4. **Déploiements indépendants** — Le test ultime : peut-on déployer service A sans toucher service B ?

---

## À retenir

> Le monolithe distribué est souvent le résultat d'une migration vers les microservices mal planifiée.
> Si vos services ne peuvent pas être déployés indépendamment, ce ne sont pas des microservices.

---

→ [Suite : Split Front / Back](./03-split-front-back.md)
