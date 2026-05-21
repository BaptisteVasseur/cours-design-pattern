# Microservices

> *"Des services petits, indépendants, centrés sur une capacité métier unique."*
> — Sam Newman, *Building Microservices*

---

## Vue d'ensemble

![Monolithic vs Microservices](https://miro.medium.com/v2/1*xNJL3aIuKBnYkWyY5yUQiQ.png)

![Microservices Architecture](https://microservices.io/i/Microservice_Architecture.png)

---

## Définition

Une architecture microservices est une suite de **petits services autonomes** qui :
- Sont déployés **indépendamment**
- Possèdent leurs **propres données**
- Communiquent via des **API légères** (HTTP/REST, gRPC, messages)
- Sont **organisés autour des capacités métier**
- Peuvent être écrits dans des **langages différents**

---

## Les caractéristiques des vrais microservices

### Single Responsibility au niveau service

```
✅ Un microservice = une capacité métier

service-catalogue/       → Gérer les produits, rechercher, filtrer
service-commandes/       → Passer, suivre, annuler des commandes
service-paiement/        → Traiter les paiements, remboursements
service-livraison/       → Gérer l'expédition, le tracking
service-notification/    → Emails, SMS, push notifications
service-utilisateurs/    → Authentification, profils

❌ PAS ça :
service-controllers/     → Ça c'est du monolithe distribué
service-models/
service-services/
```

### Données isolées (Database per Service)

```
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ service-commandes│    │ service-catalogue│    │ service-paiement │
│                  │    │                  │    │                  │
│  ┌────────────┐  │    │  ┌────────────┐  │    │  ┌────────────┐  │
│  │ PostgreSQL │  │    │  │  MongoDB   │  │    │  │   MySQL    │  │
│  │ (commandes)│  │    │  │ (produits) │  │    │  │ (paiements)│  │
│  └────────────┘  │    │  └────────────┘  │    │  └────────────┘  │
└──────────────────┘    └──────────────────┘    └──────────────────┘

→ Chaque service choisit sa propre technologie de stockage
→ Aucun accès direct aux données d'un autre service
```

---

## Communication entre services

### Synchrone — API REST / gRPC

```
Service A ──HTTP GET /products/42──► Service B
          ◄──────── 200 JSON ────────

Avantages : Simple, debuggable, résultat immédiat
Inconvénients : Couplage temporel (si B est down, A échoue)
```

### Asynchrone — Messages

```
Service A ──publish(CommandePassee)──► Message Broker
                                              │
                          ┌───────────────────┼─────────────────────┐
                          ▼                   ▼                     ▼
                  Service Notif       Service Stock         Service Facture
                  (email)             (réserve)             (facture)

Avantages : Découplage total, résilience, scalabilité
Inconvénients : Cohérence éventuelle, complexité
```

---

## L'API Gateway

Le point d'entrée unique pour les clients externes.

```
                              ┌─────────────────────┐
                              │     API GATEWAY      │
Mobile App ──────────────────►│                      │
                              │ • Authentification   │
Browser ─────────────────────►│ • Rate limiting      │
                              │ • Routage            │
3rd Party ───────────────────►│ • Agrégation         │
                              │ • Cache              │
                              └──────────┬───────────┘
                                         │
              ┌──────────────────────────┼────────────────────────┐
              ▼                          ▼                         ▼
    ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
    │service-commandes│      │service-catalogue│      │service-utilisat.│
    └─────────────────┘      └─────────────────┘      └─────────────────┘
```

**Exemples** : Kong, AWS API Gateway, Nginx, Traefik, Spring Cloud Gateway

---

## Service Discovery

Dans un environnement dynamique, les services ont des adresses IP changeantes.

```
Service A veut parler à Service B :

  ❌ Sans Service Discovery :
     Service A ──HTTP──► 192.168.1.42:8080
     (adresse IP codée en dur → catastrophe si Service B redémarre)

  ✅ Avec Service Discovery :
     1. Service B démarre → s'enregistre dans le Registry
     2. Service A interroge le Registry : "Où est Service B ?"
     3. Registry répond : "192.168.1.42:8080"
     4. Service A peut contacter Service B

Outils : Consul, Eureka (Spring), Kubernetes (DNS interne)
```

---

## La Saga Pattern (transactions distribuées)

Dans les microservices, **pas de transactions ACID entre services**. On utilise les Sagas.

### Le problème

```
Passer une commande implique :
  1. Réserver le stock (service-stock)
  2. Débiter la carte (service-paiement)
  3. Créer la commande (service-commandes)

Si l'étape 3 échoue après que 1 et 2 ont réussi ?
→ Rollback impossible sur des services séparés !
```

### La solution : Compensating Transactions

```
Saga Passer Commande :

  SUCCÈS :
  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
  │ReserverStock │───►│DebitCarte    │───►│CréerCommande │
  │     ✅       │    │     ✅       │    │     ✅       │
  └──────────────┘    └──────────────┘    └──────────────┘

  ÉCHEC à l'étape 3 :
  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
  │ReserverStock │───►│DebitCarte    │───►│CréerCommande │
  │     ✅       │    │     ✅       │    │     ❌       │
  └──────┬───────┘    └──────┬───────┘    └──────────────┘
         │                   │
         ▼                   ▼
   LibererStock         RembourserCarte
   (compensation)       (compensation)
```

---

## Les défis opérationnels

C'est le grand sujet que les tutoriels oublient souvent.

```
Microservices = Complexité opérationnelle ×10

  ✅ Ce que vous gagnez :             ❌ Ce que vous devez gérer :
  ──────────────────────              ──────────────────────────
  Scalabilité indépendante            Orchestration (Kubernetes)
  Déploiement indépendant             Service Discovery
  Technologie libre par service       Load Balancing
  Faible couplage                     Distributed Tracing
  Résilience                          Log Aggregation
  Équipes autonomes                   Health Checks
                                      Circuit Breakers
                                      API Versioning
                                      Transactions distribuées (Saga)
                                      Sécurité inter-services (mTLS)
```

### Circuit Breaker

```
Service A ──► Service B (lent ou down)

Sans Circuit Breaker :
  → Toutes les requêtes de A attendent → A sature → cascade

Avec Circuit Breaker :
  FERMÉ : Requêtes passent normalement
  OUVERT : Trop d'erreurs → Circuit coupe, réponse rapide (fallback)
  SEMI-OUVERT : Test périodique pour voir si B est revenu

Librairies : Hystrix (Java), Resilience4j, Polly (.NET)
```

---

## L'outillage indispensable

| Catégorie | Outils |
|-----------|--------|
| **Orchestration** | Kubernetes, Docker Swarm |
| **Service Mesh** | Istio, Linkerd |
| **API Gateway** | Kong, AWS API Gateway, Traefik |
| **Message Broker** | Kafka, RabbitMQ, SQS |
| **Monitoring** | Prometheus + Grafana |
| **Tracing** | Jaeger, Zipkin |
| **Log Aggregation** | ELK Stack, Loki |
| **CI/CD** | GitHub Actions, ArgoCD |

---

## Microservices vs Monolithe : le vrai comparatif

| Critère | Monolithe | Microservices |
|---------|-----------|---------------|
| Complexité initiale | Faible | Élevée |
| Vitesse de développement (début) | Rapide | Lente |
| Vitesse de développement (maturité) | Ralentit | Reste stable |
| Scalabilité | Globale | Par service |
| Déploiement | Simple | Complexe |
| Debugging | Simple | Complexe (tracing) |
| Technologie | Unifiée | Liberté |
| Équipes | Coordination nécessaire | Autonomes |
| Idéal pour | Startups, domaines non définis | Organisations à scale |

---

## La migration progressive (Strangler Fig Pattern)

Le pattern de migration recommandé par Martin Fowler.

```
Phase 1 : Monolithe intact
┌──────────────────────────────────┐
│        MONOLITHE                  │
│  Catalogue + Commandes + Auth    │
└──────────────────────────────────┘

Phase 2 : Extraire les services les plus simples en premier
┌──────────────────────┐    ┌──────────────┐
│      MONOLITHE        │    │ service-auth │
│  Catalogue + Commandes│    │   (nouveau)  │
└──────────────────────┘    └──────────────┘

Phase 3 : Continuer l'extraction
┌──────────────┐    ┌──────────────┐    ┌─────────────────┐
│   MONOLITHE   │    │ service-auth │    │service-catalogue│
│   Commandes   │    │              │    │   (nouveau)     │
└──────────────┘    └──────────────┘    └─────────────────┘

Phase N : Le monolithe est étranglé (strangled) et disparaît
```

---

## Quand passer aux microservices ?

```
✅ Les bons signaux :
  • L'équipe dépasse 15-20 développeurs sur la même codebase
  • Des parties du système ont des besoins de scalabilité très différents
  • Des équipes différentes déploient le même monolithe et se bloquent
  • Le domaine est bien compris et les Bounded Contexts sont clairs
  • Vous avez l'expertise opérationnelle (DevOps, Kubernetes)

❌ Les mauvais signaux :
  • "Les microservices c'est moderne"
  • Le domaine métier n'est pas encore stable
  • L'équipe n'a pas d'expérience en opérations distribuées
  • On n'a pas encore résolu les problèmes du monolithe
```

> **Règle d'or** : Ne migrez vers les microservices que si vous ressentez la *douleur* du monolithe. Pas avant.

---

→ [Suite : Architecture Hexagonale (Bonus)](./09-hexagonale.md)
