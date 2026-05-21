# Event-Driven Architecture (EDA)

> *"Au lieu d'appeler directement ce dont vous avez besoin, annoncez ce qui s'est passé et laissez les intéressés réagir."*

---

## Vue d'ensemble

![Event-Driven Architecture — E-commerce](https://media.geeksforgeeks.org/wp-content/uploads/20260127153142743572/event_driven_architecture_of_e_commerce_site.webp)

![Event Channels](https://www.scylladb.com/wp-content/uploads/Event-Driven-Architecture-diagram.png)

L'**Event-Driven Architecture** (EDA) est un style d'architecture où les composants communiquent via des **événements** plutôt que via des appels directs. Un composant **publie** un événement, d'autres composants **écoutent** et réagissent.

---

## La philosophie : d'appels directs à des événements

### Sans EDA — Couplage fort

```php
// ❌ La méthode "passerCommande" sait tout ce qui doit se passer après
class CommandeService
{
    public function passerCommande(Commande $commande): void
    {
        $this->commandeRepository->save($commande);

        // Couplage direct avec tous les effets de bord :
        $this->emailService->envoyerConfirmation($commande);
        $this->stockService->reserverStock($commande);
        $this->facturationService->creerFacture($commande);
        $this->loyauteService->crediterPoints($commande);
        $this->analyticsService->track('commande_passee', $commande);
        // → Si on ajoute une nouvelle action, on modifie cette méthode
    }
}
```

### Avec EDA — Couplage faible

```php
// ✅ La méthode fait son travail et publie un événement
class CommandeService
{
    public function passerCommande(Commande $commande): void
    {
        $this->commandeRepository->save($commande);
        $this->eventBus->publish(new CommandePassee($commande->getId()));
        // Terminé. Elle ne sait pas ce qui va se passer après.
    }
}

// Chaque listener est indépendant :
class EnvoyerEmailConfirmation implements EventListener {
    public function on(CommandePassee $event): void { ... }
}
class ReserverStock implements EventListener {
    public function on(CommandePassee $event): void { ... }
}
class CreditLoyaute implements EventListener {
    public function on(CommandePassee $event): void { ... }
}
```

---

## Les composants d'une EDA

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  EVENT PRODUCERS          EVENT BROKER         EVENT CONSUMERS   │
│                                                                  │
│  ┌──────────────┐        ┌──────────┐         ┌──────────────┐  │
│  │ Service A    │──────► │          │ ──────► │ Service X    │  │
│  └──────────────┘        │  Kafka   │         └──────────────┘  │
│                          │  RabbitMQ│                            │
│  ┌──────────────┐        │  SQS     │ ──────► ┌──────────────┐  │
│  │ Service B    │──────► │  Redis   │         │ Service Y    │  │
│  └──────────────┘        │  ...     │         └──────────────┘  │
│                          └──────────┘                            │
│  ┌──────────────┐                    ──────► ┌──────────────┐  │
│  │ Service C    │──────────────────►         │ Service Z    │  │
│  └──────────────┘                             └──────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Le Producer

Produit et publie des événements. **Ne sait pas qui les consomme.**

```json
{
  "type": "commande.passee",
  "id": "evt-123",
  "occurredAt": "2024-01-15T10:30:00Z",
  "data": {
    "commandeId": "cmd-456",
    "utilisateurId": "usr-789",
    "montantTotal": 129.99
  }
}
```

### Le Broker (Bus d'événements)

Le **routeur** des événements. Il reçoit les événements et les distribue aux consumers intéressés.

| Technologie | Usage typique |
|-------------|--------------|
| **RabbitMQ** | File de messages, routing complexe |
| **Apache Kafka** | Streaming haute volumétrie, replay |
| **AWS SQS/SNS** | Cloud natif, serverless |
| **Redis Streams** | Léger, en mémoire |
| **Symfony Messenger** | PHP, intégré au framework |

### Le Consumer

Écoute et réagit aux événements qui l'intéressent. **Ne sait pas qui les produit.**

---

## Synchrone vs Asynchrone

### EDA Synchrone (dans le même processus)

```php
// Symfony Event Dispatcher
$dispatcher->dispatch(new CommandePassee($commande));
// → Tous les listeners s'exécutent immédiatement dans le même thread
// → Si un listener plante, l'exception remonte
```

**Cas d'usage** : hooks internes, modification de l'objet avant persistance.

### EDA Asynchrone (via message broker)

```php
// Symfony Messenger avec transport async
$messageBus->dispatch(new CommandePasseeMessage($commandeId));
// → Le message est mis en file (RabbitMQ/Redis/...)
// → Les handlers s'exécutent dans des workers séparés
// → Le contrôleur répond immédiatement au client
```

**Cas d'usage** : emails, SMS, notifications push, calculs lourds, sync avec systèmes tiers.

---

## Patterns EDA

### Pub/Sub (Publication/Abonnement)

```
Publisher ──► Topic/Exchange ──► Tous les abonnés reçoivent le message

Ex: "commande.passee" → Email + Stock + Analytics reçoivent chacun une copie
```

### Queue (File de messages)

```
Producer ──► Queue ──► Un seul consumer traite chaque message

Ex: File d'envoi d'emails (un seul worker traite chaque email)
```

### Choreography vs Orchestration

```
Choreography (chorégraphie) :
  Chaque service réagit aux événements de façon autonome.
  Pas de coordinateur central.
  
  Commande ──CommandePassée──► Stock réagit
                            ──► Facturation réagit
                            ──► Email réagit

Orchestration :
  Un Saga / Process Manager pilote le flux.
  
  SagaCommande ──► appelle Stock ──► appelle Facturation ──► appelle Email
```

---

## Avantages et inconvénients

### Avantages

| Avantage | Détail |
|----------|--------|
| **Découplage** | Les services ne se connaissent pas directement |
| **Extensibilité** | Ajouter un nouveau listener = zéro modification du producer |
| **Résilience** | Si un consumer tombe, les messages restent en file |
| **Scalabilité** | Les consumers peuvent scaler indépendamment |
| **Audit trail** | Les événements constituent un historique naturel |

### Inconvénients

| Inconvénient | Comment le gérer |
|-------------|-----------------|
| **Complexité** | Utiliser un bon monitoring (Jaeger, Zipkin) |
| **Cohérence éventuelle** | Accepter que tout ne soit pas instantané |
| **Ordre des messages** | Partitionning sur Kafka, ou accepter l'idempotence |
| **Debugging difficile** | Distributed tracing, correlation IDs |
| **Idempotence** | Les handlers doivent gérer le retraitement des messages |

---

## L'idempotence : concept clé

Un handler est **idempotent** si on peut lui envoyer le même message plusieurs fois sans effet de bord indésirable.

```php
// ❌ Pas idempotent : crée un doublon si le message est retraité
public function handle(CommandePassee $event): void
{
    $this->facturationService->creerFacture($event->commandeId);
}

// ✅ Idempotent : vérifie si la facture existe déjà
public function handle(CommandePassee $event): void
{
    if (!$this->factureRepository->existsForCommande($event->commandeId)) {
        $this->facturationService->creerFacture($event->commandeId);
    }
}
```

---

## Exemple complet : e-commerce avec Symfony Messenger

```
Client → POST /commandes
           │
    ┌──────▼──────────────────────────────────────┐
    │  CommandeController                          │
    │  → UseCase PasserCommande::execute()         │
    │  → Commande sauvegardée                     │
    │  → Message dispatché en async               │
    │  → 201 Created renvoyé immédiatement        │
    └─────────────────────────────────────────────┘
           │
    ┌──────▼──────────────────────────────────────┐
    │  Queue RabbitMQ / Redis                      │
    │  [CommandePasseeMessage]                     │
    └──────────────────────────────────────────────┘
           │
    ┌──────┴────────────────────────────────────────────────────────┐
    │                                                               │
    ▼                          ▼                          ▼         
EmailHandler              StockHandler           AnalyticsHandler
Envoie confirmation       Réserve le stock       Track l'événement
```

---

## Quand utiliser l'EDA ?

```
✅ EDA est bien adaptée quand :
  • Plusieurs actions se déclenchent suite à un même événement
  • On veut découpler des équipes/services
  • Les traitements peuvent être asynchrones (emails, notifs)
  • On veut pouvoir rejouer des événements passés (cf. Event Sourcing)
  • Le système doit être extensible sans toucher au code existant

❌ EDA est complexe à mettre en place pour :
  • Des flux simples CRUD
  • Des cas où la cohérence immédiate est obligatoire
  • Des petits projets avec une seule équipe
```

---

→ [Suite : Event Sourcing](./07-event-sourcing.md)
