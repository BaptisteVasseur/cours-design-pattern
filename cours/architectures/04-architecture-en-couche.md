# Architecture en Couches (Layered Architecture)

> *"Chaque couche a une responsabilité unique et ne connaît que la couche en dessous d'elle."*

---

## Vue d'ensemble

![Architecture en couches](https://miro.medium.com/v2/1*Fj3nKsTmQ86cFL9GrvYu1g.png)

L'architecture en couches (**N-tiers** ou **Layered Architecture**) organise le code en strates horizontales. Chaque couche :
- A une **responsabilité unique**
- **Ne connaît que la couche immédiatement en dessous**
- Est **indépendante des couches au-dessus**

---

## Les couches classiques

### Architecture 3 couches (classique)

```
┌────────────────────────────────────────────┐
│            PRÉSENTATION (UI)               │
│   Controllers, Views, API endpoints        │
│   → Reçoit les requêtes, renvoie les       │
│     réponses. Ne contient PAS de logique   │
│     métier.                                │
└──────────────────┬─────────────────────────┘
                   │
┌──────────────────▼─────────────────────────┐
│            LOGIQUE MÉTIER                  │
│   Services, Use Cases, Domain Objects      │
│   → Contient TOUTE la logique applicative. │
│     Ne sait pas d'où viennent les données, │
│     ni comment elles seront affichées.     │
└──────────────────┬─────────────────────────┘
                   │
┌──────────────────▼─────────────────────────┐
│            ACCÈS AUX DONNÉES               │
│   Repositories, ORM, Query Objects         │
│   → Abstrait la persistance. La couche     │
│     métier ne sait pas si c'est MySQL,     │
│     PostgreSQL ou une API tierce.          │
└──────────────────┬─────────────────────────┘
                   │
          ┌────────▼────────┐
          │   Base de données│
          └─────────────────┘
```

### Architecture 4+ couches (DDD-style)

```
┌─────────────────────────────────────────────┐
│  COUCHE APPLICATION (Application Layer)     │
│  Controllers, CLI Commands, Message Handlers│
│  → Orchestre les use cases, pas de logique  │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│  COUCHE DOMAINE (Domain Layer)              │
│  Entities, Value Objects, Domain Services  │
│  → Le cœur du métier. Aucune dépendance     │
│    vers l'infrastructure ou l'UI.           │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│  COUCHE INFRASTRUCTURE (Infrastructure)     │
│  Repositories impl., Mailers, File Storage  │
│  → Implémente les interfaces du domaine.    │
│    Tout ce qui "sort" du processus.         │
└─────────────────────────────────────────────┘
```

---

## La règle de dépendance

**Règle fondamentale** : les dépendances ne vont que **vers le bas** (ou vers le centre pour l'hexagonale).

```
✅ Correct :
   Présentation → Domaine      (le contrôleur appelle un service)
   Infrastructure → Domaine    (le repository implémente une interface du domaine)

❌ Interdit :
   Domaine → Infrastructure    (l'entité ne doit pas importer Doctrine)
   Domaine → Présentation      (la logique métier ne doit pas connaître HTTP)
```

---

## Exemple concret en PHP/Symfony

### Structure de fichiers

```
src/
├── Application/               ← Couche Application
│   ├── Controller/
│   │   └── CommandeController.php
│   ├── MessageHandler/
│   │   └── CommandePasseeHandler.php
│   └── UseCase/
│       └── PasserCommande.php
│
├── Domain/                    ← Couche Domaine (le cœur)
│   ├── Entity/
│   │   ├── Commande.php
│   │   └── LigneCommande.php
│   ├── Repository/
│   │   └── CommandeRepositoryInterface.php  ← INTERFACE !
│   ├── Service/
│   │   └── PrixCalculator.php
│   └── Event/
│       └── CommandePassee.php
│
└── Infrastructure/            ← Couche Infrastructure
    ├── Repository/
    │   └── DoctrineCommandeRepository.php   ← IMPLÉMENTATION
    ├── Mailer/
    │   └── SymfonyMailer.php
    └── DataFixtures/
        └── AppFixtures.php
```

### Code exemple

```php
// Domain/Repository/CommandeRepositoryInterface.php
// → Interface dans le domaine, pas d'import Doctrine !
interface CommandeRepositoryInterface
{
    public function findById(CommandeId $id): ?Commande;
    public function save(Commande $commande): void;
}
```

```php
// Infrastructure/Repository/DoctrineCommandeRepository.php
// → Implémentation dans l'infra, dépend de Doctrine
class DoctrineCommandeRepository implements CommandeRepositoryInterface
{
    public function __construct(private EntityManagerInterface $em) {}

    public function findById(CommandeId $id): ?Commande
    {
        return $this->em->find(Commande::class, $id->value());
    }

    public function save(Commande $commande): void
    {
        $this->em->persist($commande);
        $this->em->flush();
    }
}
```

```php
// Application/UseCase/PasserCommande.php
// → Orchestre, mais ne contient pas la logique métier
class PasserCommande
{
    public function __construct(
        private CommandeRepositoryInterface $commandeRepository,
        private ProduitRepositoryInterface $produitRepository,
    ) {}

    public function execute(PasserCommandeInput $input): void
    {
        $produits = $this->produitRepository->findByIds($input->produitIds);
        $commande = Commande::passer($input->utilisateurId, $produits);
        $this->commandeRepository->save($commande);
    }
}
```

---

## Les bénéfices concrets

### Testabilité

```
Test unitaire du Domaine :
  → Aucune dépendance externe, tests ultra-rapides
  → On teste la logique métier pure

Test d'intégration de l'Infrastructure :
  → On teste que le Repository fait les bonnes requêtes SQL

Test fonctionnel de l'Application :
  → On teste le use case complet avec une vraie DB (en mémoire)
```

### Maintenabilité

```
Changer d'ORM (Doctrine → DBAL) :
  → On ne touche qu'à l'Infrastructure
  → Le Domaine et l'Application restent intacts

Ajouter une API GraphQL :
  → On ajoute un nouveau Controller dans Application
  → On réutilise les mêmes Use Cases
  → Le Domaine n'est pas touché
```

---

## Anti-patterns courants

### L'Anemic Domain Model

```php
// ❌ Entité sans logique = sac à données
class Commande {
    public int $id;
    public string $statut;
    public float $total;
}

// Toute la logique dans le service (mauvais)
class CommandeService {
    public function annuler(Commande $commande): void {
        if ($commande->statut === 'livree') {
            throw new \Exception("...");
        }
        $commande->statut = 'annulee';
    }
}
```

```php
// ✅ Entité riche = logique métier encapsulée
class Commande {
    private string $statut;

    public function annuler(): void {
        if ($this->estLivree()) {
            throw new CommandeDejaLivreeException();
        }
        $this->statut = Statut::ANNULEE;
        $this->recordEvent(new CommandeAnnulee($this->id));
    }
}
```

---

## À retenir

> L'architecture en couches est le **fondement** de toutes les autres architectures (DDD, Hexagonale, Clean Architecture). Maîtrisez-la d'abord.

---

→ [Suite : Domain-Driven Design (DDD)](./05-domain-driven-design.md)
