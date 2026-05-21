# Pourquoi un Lead Tech doit maîtriser l'architecture logicielle ?

---

## Le Lead Tech : bien plus qu'un développeur senior

Un développeur senior écrit du bon code. Un **Lead Tech**, lui, garantit que **le bon code est écrit au bon endroit, de la bonne façon, pour les bonnes raisons.**

C'est une différence fondamentale.

```
Développeur Senior          Lead Tech
─────────────────           ─────────────────────────────────────
"Comment coder ça ?"   →    "Devrait-on coder ça comme ça ?"
"Ça marche !"          →    "Ça marche aujourd'hui, dans 2 ans ?"
"J'ai refactorisé"     →    "On a une dette technique ici, voici le plan"
"Mon module est propre"→    "Notre système est maintenable et évolutif"
```

---

## Les trois dimensions d'un Lead Tech

### 1. La technique pure
Maîtriser les langages, les frameworks, les outils. C'est **le prérequis**, pas la finalité.

### 2. L'architecture logicielle ← *le sujet de ce cours*
Savoir structurer une application pour qu'elle reste maintenable, testable, évolutive et compréhensible — même quand l'équipe grandit et que les exigences changent.

### 3. L'humain et l'organisation
Guider l'équipe, documenter les décisions, aligner tech et business. On ne couvre pas ça ici, mais c'est tout aussi crucial.

---

## Pourquoi l'architecture, concrètement ?

### Le coût de la mauvaise architecture

> **Loi de Conway** (1967) : *"Les organisations conçoivent des systèmes qui reproduisent leur structure de communication."*

En d'autres termes : si votre équipe est désorganisée, votre code le sera aussi. Et inversement, une mauvaise architecture force votre équipe à travailler d'une mauvaise façon.

Les conséquences d'une architecture négligée :

```
Semaine 1    ████████████████████  Vitesse : 100%
Mois 3       █████████████         Vitesse : 65%  (dette technique)
Mois 6       ████████              Vitesse : 40%  (couplage fort)
An 1         █████                 Vitesse : 25%  (peur de toucher)
An 2         ██                    Vitesse : 10%  ("on refait tout")
```

C'est le **"Big Ball of Mud"** — le pattern d'architecture le plus répandu... et le moins voulu.

### Ce que l'architecture apporte

| Problème métier | Solution architecturale |
|----------------|------------------------|
| L'équipe grandit, tout le monde se marche dessus | Bounded Contexts (DDD), Microservices |
| Impossible d'ajouter une feature sans tout casser | Architecture en couches, Hexagonale |
| On ne peut pas tester | Inversion de dépendances, Ports & Adapters |
| La base de données est partout dans le code | Repository Pattern, Couche Domaine |
| Un changement casse 10 autres choses | Couplage faible, Événements |
| Impossible de scaler | Microservices, CQRS, Event Sourcing |

---

## La carte mentale du Lead Tech

```
                    ┌─────────────────────────────┐
                    │         LEAD TECH            │
                    └─────────────┬───────────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          ▼                       ▼                       ▼
   ┌─────────────┐       ┌─────────────────┐     ┌──────────────┐
   │  PRINCIPES  │       │  ARCHITECTURES  │     │   PATTERNS   │
   │   SOLID     │       │                 │     │              │
   │             │       │  - Monolithe    │     │  Créationnels│
   │ S O L I D   │       │  - Couches      │     │  Structurels │
   │             │       │  - DDD          │     │  Comportement│
   └─────────────┘       │  - EDA          │     └──────────────┘
                         │  - Event Source │
                         │  - Microservice │
                         └─────────────────┘
```

---

## Le voyage de l'apprenti au maître

### Niveau 0 — Le débutant
*"Je fais fonctionner le code."*
Tout dans le contrôleur. La logique métier dans les vues. La base de données partout.

### Niveau 1 — Le développeur structuré
*"Je sépare un peu les responsabilités."*
Connaissance des couches MVC, des services. Commence à écrire des tests.

### Niveau 2 — Le développeur orienté domaine
*"Je modélise le métier avant de coder."*
Comprend le DDD, les Value Objects, les Aggregates. Parle le même langage que le métier.

### Niveau 3 — L'architecte
*"Je choisis l'architecture en fonction du contexte."*
Sait quand utiliser un monolithe, quand passer aux microservices, connaît les compromis de chaque approche.

### Niveau 4 — Le Lead Tech complet
*"Je fais évoluer l'architecture avec l'organisation."*
Aligne les choix techniques avec la stratégie business. Anticipe la dette technique. Forme l'équipe.

---

## Ce que ce cours vous apporte

À la fin de ce cours, vous serez capable de :

- ✅ **Choisir** l'architecture adaptée à un contexte donné (taille d'équipe, complexité métier, exigences de scalabilité)
- ✅ **Justifier** vos choix architecturaux face à un CTO, des pairs ou des devs juniors
- ✅ **Reconnaître** les anti-patterns et la dette technique avant qu'ils deviennent critiques
- ✅ **Appliquer** les principes SOLID dans votre code quotidien
- ✅ **Utiliser** les design patterns comme un vocabulaire commun avec votre équipe
- ✅ **Évoluer** une architecture existante de façon incrémentale et sécurisée

---

## Les grandes questions auxquelles vous saurez répondre

> *"Notre startup grandit. On est 3 devs sur un monolithe. Quand passe-t-on aux microservices ?"*

> *"Notre code métier est partout dans les contrôleurs. Comment on s'en sort sans tout réécrire ?"*

> *"Le client veut un historique de toutes les modifications. Comment on fait ça proprement ?"*

> *"On a besoin que notre système soit event-driven. Par où on commence ?"*

Ces questions ont des réponses. Ce cours vous donne les outils pour y répondre avec confiance.

---

## Structure recommandée de lecture

```
00 · Introduction (vous êtes ici)
      │
      ▼
01 à 08 · Architectures (dans l'ordre, elles se construisent les unes sur les autres)
      │
      ▼
02 · Principes SOLID (la fondation théorique)
      │
      ▼
03 · Design Patterns (les outils concrets)
```

---

→ [Commencer avec le Monolithe](./architectures/01-monolithe.md)
