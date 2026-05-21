# Cours d'Architecture Logicielle & Design Patterns

> Un guide complet pour devenir un excellent Lead Tech / Architecte logiciel

---

## Sommaire

### [00 · Introduction — Pourquoi un Lead Tech doit maîtriser tout ça ?](./00-introduction-lead-tech.md)

---

### Partie 1 — Les Architectures Logicielles

| # | Chapitre | Mots clés |
|---|---------|-----------|
| 01 | [Le Monolithe](./architectures/01-monolithe.md) | Simple, couplé, tout-en-un |
| 02 | [Le Monolithe Distribué](./architectures/02-monolithe-distribue.md) | Pire des deux mondes |
| 03 | [Split Front / Back](./architectures/03-split-front-back.md) | SPA, API REST, découplage UI |
| 04 | [Architecture en Couches](./architectures/04-architecture-en-couche.md) | Layered, N-tiers, séparation des responsabilités |
| 05 | [Domain-Driven Design (DDD)](./architectures/05-domain-driven-design.md) | Domaine métier, Bounded Context, Aggregate |
| 06 | [Event-Driven Architecture (EDA)](./architectures/06-event-driven-architecture.md) | Événements, découplage asynchrone |
| 07 | [Event Sourcing](./architectures/07-event-sourcing.md) | Audit trail, rejeu, immutabilité |
| 08 | [Microservices](./architectures/08-microservices.md) | Autonomie, scalabilité, complexité opérationnelle |
| 09 | [Architecture Hexagonale (Ports & Adapters)](./architectures/09-hexagonale.md) | ⭐ Bonus |
| 10 | [CQRS](./architectures/10-cqrs.md) | ⭐ Bonus — séparation lecture/écriture |

---

### Partie 2 — Les Principes SOLID

👉 [Lire le cours SOLID](./02-solid.md)

| Principe | Mnémotechnique |
|---------|---------------|
| **S** ingle Responsibility | Une classe = une raison de changer |
| **O** pen/Closed | Ouvert à l'extension, fermé à la modification |
| **L** iskov Substitution | Les sous-classes respectent le contrat parent |
| **I** nterface Segregation | Des interfaces petites et spécialisées |
| **D** ependency Inversion | Dépendre des abstractions, pas des implémentations |

---

### Partie 3 — Les Design Patterns

👉 [Lire le cours Design Patterns](./03-design-patterns.md)

| Catégorie | Patterns couverts |
|-----------|------------------|
| **Créationnels** | Singleton, Factory Method, Abstract Factory, Builder, Prototype |
| **Structurels** | Adapter, Decorator, Facade, Proxy, Composite, Bridge |
| **Comportementaux** | Observer, Strategy, Command, Chain of Responsibility, Template Method, State, Iterator |

---

## Comment utiliser ce cours ?

1. **Commencer par l'introduction** pour comprendre le contexte global
2. **Lire les architectures dans l'ordre** — elles se complètent et se répondent
3. **SOLID avant les patterns** — les patterns implémentent souvent les principes SOLID
4. **Pratiquer** — chaque concept est illustré avec des exemples concrets

---

> *"Architecture is about the important stuff. Whatever that is."* — Ralph Johnson
