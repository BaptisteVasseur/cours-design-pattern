# Architecture Hexagonale (Ports & Adapters)

> *"Permettre à une application d'être pilotée de façon égale par des utilisateurs, des programmes, des tests automatisés ou des scripts batch, et d'être développée et testée en isolation des dispositifs et bases de données qu'elle utilise à l'exécution."*
> — Alistair Cockburn (2005)

---

## Pourquoi "hexagonale" ?

La forme hexagonale n'a pas de signification particulière — Cockburn a choisi un hexagone pour avoir suffisamment de faces pour représenter les différents ports. Le nom officiel est **Ports & Adapters**.

```
                    ┌─────────────────────────────────┐
                    │          ADAPTERS               │
     REST API  ─────┤  ┌───────────────────────────┐  ├───── MySQL
                    │  │                           │  │
     GraphQL   ─────┤  │     DOMAINE MÉTIER        │  ├───── Redis
                    │  │                           │  │
     CLI        ────┤  │   (Hexagone / Cœur)       │  ├───── Email SMTP
                    │  │                           │  │
     Tests      ────┤  └───────────────────────────┘  ├───── API tierce
                    │          ADAPTERS               │
                    └─────────────────────────────────┘

               PORTS PRIMAIRES               PORTS SECONDAIRES
               (pilotent l'app)              (pilotés par l'app)
```

---

## Les concepts clés

### Le Domaine (l'hexagone)

Le cœur de l'application. Contient la logique métier pure. **Aucune dépendance vers l'extérieur.**

### Les Ports

Des **interfaces** qui définissent comment communiquer avec l'hexagone.

```
Ports primaires (Driving/In) :
  → Comment les acteurs externes pilotent l'application
  → Ex: CommandeUseCaseInterface { passer(), annuler() }

Ports secondaires (Driven/Out) :
  → Comment l'application communique avec l'infrastructure
  → Ex: CommandeRepositoryInterface { save(), findById() }
       EmailServiceInterface { send() }
```

### Les Adapters

Des **implémentations concrètes** des ports pour chaque technologie.

```
Adapters primaires (Driving) :
  → HTTP Controller (transforme une requête HTTP en appel de use case)
  → CLI Command (transforme des args en appel de use case)
  → Test Adapter (appelle directement le use case dans les tests)

Adapters secondaires (Driven) :
  → DoctrineCommandeRepository (implémente le port avec Doctrine)
  → InMemoryCommandeRepository (implémente le port avec un tableau PHP)
  → SymfonyMailer (implémente le port email avec Swift/Mailer)
```

---

## La règle de dépendance

```
❌ Avant l'hexagonale :
   Controller ──► Service ──► Repository ──► Doctrine

   Le Domaine dépend de l'Infrastructure !
   On ne peut pas tester le Service sans Doctrine.

✅ Avec l'hexagonale :
   HTTP Adapter ──► [Port In] ──► DOMAINE ──► [Port Out] ──► DB Adapter
                                              │
                                    Dépend d'une INTERFACE,
                                    pas d'une implémentation !
```

---

## Exemple complet en PHP

### Structure de fichiers

```
src/
├── Domain/                              ← L'hexagone
│   ├── Entity/
│   │   └── Commande.php
│   ├── UseCase/
│   │   └── PasserCommandeUseCase.php    ← Port Primaire (interface ou classe)
│   ├── Port/
│   │   ├── In/
│   │   │   └── PasserCommandePort.php  ← Interface du port primaire
│   │   └── Out/
│   │       ├── CommandeRepository.php  ← Interface du port secondaire
│   │       └── EmailNotifier.php       ← Interface du port secondaire
│   └── Service/
│       └── PrixCalculator.php
│
├── Application/                         ← Adapters primaires
│   ├── Http/
│   │   └── CommandeController.php      ← Adapter HTTP → Domain
│   └── Cli/
│       └── ImportCommandesCommand.php  ← Adapter CLI → Domain
│
└── Infrastructure/                      ← Adapters secondaires
    ├── Repository/
    │   ├── DoctrineCommandeRepository.php  ← Adapter DB
    │   └── InMemoryCommandeRepository.php  ← Adapter test
    └── Notification/
        └── SymfonyMailerNotifier.php        ← Adapter email
```

### Le Port Secondaire (interface dans le domaine)

```php
// Domain/Port/Out/CommandeRepository.php
interface CommandeRepository
{
    public function findById(CommandeId $id): ?Commande;
    public function save(Commande $commande): void;
    public function nextId(): CommandeId;
}
```

### L'Adapter Secondaire (implémentation dans l'infra)

```php
// Infrastructure/Repository/DoctrineCommandeRepository.php
class DoctrineCommandeRepository implements CommandeRepository
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

// Infrastructure/Repository/InMemoryCommandeRepository.php
class InMemoryCommandeRepository implements CommandeRepository
{
    private array $commandes = [];

    public function findById(CommandeId $id): ?Commande
    {
        return $this->commandes[$id->value()] ?? null;
    }

    public function save(Commande $commande): void
    {
        $this->commandes[$commande->getId()->value()] = $commande;
    }
}
```

### Le Use Case (cœur de l'hexagone)

```php
// Domain/UseCase/PasserCommande.php
class PasserCommande
{
    public function __construct(
        private readonly CommandeRepository $commandeRepository,  // Port Out
        private readonly ProduitRepository $produitRepository,    // Port Out
        private readonly EmailNotifier $emailNotifier,            // Port Out
    ) {}

    public function execute(PasserCommandeInput $input): CommandeId
    {
        $produits = $this->produitRepository->findByIds($input->produitIds);

        $commande = Commande::passer(
            $input->utilisateurId,
            $produits,
        );

        $this->commandeRepository->save($commande);
        $this->emailNotifier->notifierCommandePassee($commande);

        return $commande->getId();
    }
}
```

### L'Adapter Primaire (Controller HTTP)

```php
// Application/Http/CommandeController.php
class CommandeController extends AbstractController
{
    public function __construct(
        private readonly PasserCommande $passerCommande,  // Port In
    ) {}

    #[Route('/commandes', methods: ['POST'])]
    public function passer(Request $request): JsonResponse
    {
        $input = new PasserCommandeInput(
            utilisateurId: new UtilisateurId($request->get('utilisateur_id')),
            produitIds: $request->get('produits'),
        );

        $commandeId = $this->passerCommande->execute($input);

        return $this->json(['id' => $commandeId->value()], 201);
    }
}
```

---

## Le grand avantage : la testabilité

```php
// Test unitaire du Use Case sans aucune infrastructure !
class PasserCommandeTest extends TestCase
{
    public function test_passer_une_commande(): void
    {
        // On injecte des adapters en mémoire
        $commandeRepo = new InMemoryCommandeRepository();
        $produitRepo  = new InMemoryProduitRepository();
        $notifier     = new FakeEmailNotifier();

        $useCase = new PasserCommande($commandeRepo, $produitRepo, $notifier);

        $input = new PasserCommandeInput(
            utilisateurId: UtilisateurId::fromString('usr-1'),
            produitIds: ['prod-1', 'prod-2'],
        );

        $commandeId = $useCase->execute($input);

        // Assertions sur les repos en mémoire
        $commande = $commandeRepo->findById($commandeId);
        $this->assertNotNull($commande);
        $this->assertTrue($notifier->emailEnvoye());
    }
}
```

**Résultat** : Test ultra-rapide (millisecondes), aucune DB, aucun serveur.

---

## Hexagonale vs Couches vs Clean Architecture

```
Architecture en Couches    Architecture Hexagonale    Clean Architecture
──────────────────────     ───────────────────────    ──────────────────
Présentation               Adapters primaires         Frameworks & Drivers
     │                          │                          │
Logique Métier             Domaine                    Use Cases
     │                     (hexagone)                      │
Infrastructure             Adapters secondaires       Entities
     │                          │                          │
Base de données            Infrastructure             External Interfaces

→ Même philosophie, terminologies différentes.
→ La règle de dépendance est identique : vers le centre.
```

---

## À retenir

> L'architecture hexagonale est une **excellente cible** pour une application bien structurée. Elle garantit que le domaine métier est testable et indépendant des frameworks.
> C'est le mariage parfait avec DDD.

---

→ [Suite : CQRS](./10-cqrs.md)
