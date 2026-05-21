# CQRS — Command Query Responsibility Segregation

> *"Séparer les opérations qui modifient l'état (commands) de celles qui le lisent (queries)."*
> — Greg Young

---

## Le principe de base

CQRS vient du principe **CQS** (Command-Query Separation) de Bertrand Meyer :

> *"Une méthode doit soit retourner un résultat (query), soit modifier l'état (command), mais jamais les deux."*

CQRS applique ce principe **au niveau architectural** en séparant deux modèles distincts.

```
Sans CQRS :
  CommandeService.passerCommande()  → modifie ET retourne
  CommandeService.getCommande()     → lit ET retourne
  CommandeService.annuler()         → modifie ET retourne

Avec CQRS :
  ┌─────────────────────────────────────────────────────┐
  │  COMMAND SIDE (écriture)   │   QUERY SIDE (lecture) │
  │                            │                         │
  │  PasserCommandeCommand     │   GetCommandeQuery      │
  │  AnnulerCommandeCommand    │   ListCommandesQuery    │
  │  ModifierAdresseCommand    │   DashboardQuery        │
  │                            │                         │
  │  → Modifie l'état          │   → Lit l'état          │
  │  → Ne retourne rien        │   → Ne modifie rien     │
  │    (ou juste un ID)        │   → Optimisé pour lire  │
  └─────────────────────────────────────────────────────┘
```

---

## CQRS Simple (même modèle, chemins séparés)

La forme la plus simple : **un seul modèle de données**, mais des chemins de code séparés.

```
        ┌─────────────────────────────────────────────┐
        │                                             │
Request ─►  CommandBus  ──► CommandHandler ──► Écriture
        │                                      │      │
        │                                   Domaine  DB
        │                                      │      │
Request ─►  QueryBus    ──► QueryHandler  ──► Lecture│
        │                                             │
        └─────────────────────────────────────────────┘
```

```php
// Command (intention de modifier)
class PasserCommandeCommand
{
    public function __construct(
        public readonly string $utilisateurId,
        public readonly array $produits,
    ) {}
}

// Command Handler (traitement)
class PasserCommandeHandler
{
    public function __invoke(PasserCommandeCommand $command): void
    {
        $commande = Commande::passer(
            UtilisateurId::fromString($command->utilisateurId),
            $command->produits,
        );
        $this->commandeRepository->save($commande);
    }
}

// Query (demande de lecture)
class GetCommandeQuery
{
    public function __construct(
        public readonly string $commandeId,
    ) {}
}

// Query Handler (lecture directe, optimisée)
class GetCommandeHandler
{
    public function __invoke(GetCommandeQuery $query): CommandeDTO
    {
        // On peut faire une requête SQL directe, dénormalisée, sans passer par l'ORM
        $result = $this->connection->fetchOne(
            'SELECT c.*, u.email FROM commandes c JOIN users u ON c.user_id = u.id WHERE c.id = ?',
            [$query->commandeId]
        );
        return CommandeDTO::fromRow($result);
    }
}
```

---

## CQRS Avancé (modèles séparés)

La forme avancée : **deux modèles de données distincts**, synchronisés via des événements.

```
                    ┌──────────────────────────────────────────┐
  COMMAND SIDE      │                                          │   QUERY SIDE
                    │                                          │
  Commande ──────►  │   WRITE MODEL        READ MODELS         │ ──────► Vues
  (Aggregate)       │   (normalisé,    ──► (dénormalisés,      │         (API)
                    │    optimisé pour     optimisés pour la   │
                    │    la cohérence)     lecture rapide)     │
                    │         │                  ▲             │
                    │         └── Events ────────┘             │
                    │                                          │
                    └──────────────────────────────────────────┘
```

### Le Write Model — centré sur la cohérence

```php
// L'Aggregate protège les invariants métier
class Commande
{
    private CommandeId $id;
    private Statut $statut;
    private array $lignes = [];

    public function ajouterProduit(Produit $produit, int $qte): void
    {
        if (count($this->lignes) >= 10) {
            throw new TropDeLignesException();
        }
        $this->lignes[] = new LigneCommande($produit, $qte);
    }
}
```

### Les Read Models — centrés sur la performance

```php
// Projection 1 : Liste des commandes pour l'admin
// Table: commandes_admin_view
// { id, client_email, total, nb_articles, statut, date }

// Projection 2 : Dashboard temps réel
// Table: dashboard_stats
// { commandes_aujourd_hui, ca_aujourd_hui, commandes_en_cours }

// Projection 3 : Historique client
// Table: commandes_client_view
// { id, resume, date, statut, tracking_url }

// Ces tables sont dénormalisées et optimisées pour la lecture.
// Elles sont maintenues par des Event Handlers.
```

### Les Event Handlers mettent à jour les projections

```php
class CommandeProjector
{
    public function onCommandePassee(CommandePassee $event): void
    {
        $this->db->insert('commandes_admin_view', [
            'id'           => $event->commandeId,
            'client_email' => $event->clientEmail,
            'total'        => $event->total,
            'nb_articles'  => $event->nbArticles,
            'statut'       => 'en_cours',
            'date'         => $event->occurredAt,
        ]);

        $this->db->increment('dashboard_stats', 'commandes_aujourd_hui');
        $this->db->increment('dashboard_stats', 'ca_aujourd_hui', $event->total);
    }

    public function onCommandeLivree(CommandeLivree $event): void
    {
        $this->db->update('commandes_admin_view',
            ['statut' => 'livree'],
            ['id' => $event->commandeId]
        );
    }
}
```

---

## Le Bus de commandes / requêtes

Un pattern courant pour dispatcher commands et queries vers leurs handlers.

```php
// Symfony Messenger comme Command Bus
class CommandeController
{
    public function passer(Request $request): JsonResponse
    {
        // Dispatch une Command (écriture)
        $this->commandBus->dispatch(new PasserCommandeCommand(
            utilisateurId: $request->get('user'),
            produits: $request->get('produits'),
        ));

        return $this->json(['status' => 'ok'], 202);
    }

    public function show(string $id): JsonResponse
    {
        // Dispatch une Query (lecture)
        $commande = $this->queryBus->ask(new GetCommandeQuery($id));

        return $this->json($commande);
    }
}
```

---

## CQRS + Event Sourcing : la combinaison puissante

```
Client → Command → CommandHandler → Aggregate → Events stockés dans Event Store
                                                         │
                                                         ▼
                                              Event Handlers (Projectors)
                                                         │
                                        ┌────────────────┼───────────────────┐
                                        ▼                ▼                   ▼
                              Vue "Liste commandes"  Vue "Dashboard"  Vue "Client"
                                        │                │                   │
Client ← Query ←────────────────────────┘────────────────┘───────────────────┘
```

---

## Avantages et inconvénients

### Avantages

| Avantage | Explication |
|---------|-------------|
| **Performance lecture** | Les read models sont optimisés, dénormalisés |
| **Scalabilité asymétrique** | Si 90% lecture, scaler uniquement le read side |
| **Flexibilité** | Ajouter une nouvelle vue sans toucher au write model |
| **Clarté** | Le code de lecture et d'écriture ne se mélange plus |
| **Évolution** | Modifier la logique d'écriture sans impacter les vues |

### Inconvénients

| Inconvénient | Mitigation |
|-------------|-----------|
| **Complexité** | Ne l'utiliser que si la complexité est justifiée |
| **Cohérence éventuelle** | Les projections peuvent avoir un léger délai |
| **Plus de code** | 2x plus de classes (command + query handlers) |
| **Synchronisation** | Les projections peuvent désynchroniser |

---

## Quand utiliser CQRS ?

```
✅ CQRS simple (chemins séparés) :
  • Quasi-toujours bénéfique dans une architecture en couches
  • Clarifie le code sans grande complexité

✅ CQRS avancé (modèles séparés) :
  • Système avec beaucoup plus de lectures que d'écritures
  • Besoins de reporting/dashboard complexes
  • Déjà en Event Sourcing
  • Scalabilité asymétrique nécessaire

❌ CQRS est surdimensionné pour :
  • Applications CRUD simples
  • Petites équipes sans besoin de scalabilité
  • Projets sans complexité métier
```

---

## La trinité : DDD + CQRS + Event Sourcing

```
DDD          → Modéliser correctement le domaine métier
CQRS         → Séparer lecture et écriture
Event Sourcing → Persister les événements plutôt que l'état

Ensemble :
  Commands ──► Aggregates (DDD) ──► Events (ES) ──► Projections (CQRS Read)
  Queries  ◄────────────────────────────────────── Projections (CQRS Read)
```

---

→ Retour au [sommaire](../README.md) | Lire [les principes SOLID](../02-solid.md)
