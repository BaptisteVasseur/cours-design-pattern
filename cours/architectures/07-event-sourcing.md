# Event Sourcing

> *"Au lieu de sauvegarder l'état actuel, sauvegardez tous les événements qui ont conduit à cet état."*

---

## Le principe fondamental

![Event Sourcing](https://web-id.fr/curator/Blog/Event%20Sourcing/event-sourcing-image.jpg?fm=webp&h=auto&w=500&s=dc9a7453d324d69f49d8f83949d463cf)

### La persistance classique

```
┌─────────────────────────────────────────────────────────┐
│                  BASE DE DONNÉES CLASSIQUE               │
│                                                          │
│  commandes table :                                       │
│  ┌────┬─────────┬──────────┬──────────────────────────┐ │
│  │ id │ statut  │ total    │ updated_at               │ │
│  ├────┼─────────┼──────────┼──────────────────────────┤ │
│  │ 1  │ livrée  │ 129.99   │ 2024-01-20               │ │
│  └────┴─────────┴──────────┴──────────────────────────┘ │
│                                                          │
│  → On voit l'état ACTUEL mais pas l'historique.         │
│  → "Comment est-on arrivé à cet état ?" → impossible.   │
└─────────────────────────────────────────────────────────┘
```

### Avec Event Sourcing

```
┌─────────────────────────────────────────────────────────┐
│                   EVENT STORE                            │
│                                                          │
│  events table :                                          │
│  ┌────┬─────────┬──────────────────┬───────────────────┐│
│  │ id │ agg_id  │ type             │ data              ││
│  ├────┼─────────┼──────────────────┼───────────────────┤│
│  │ 1  │ cmd-1   │ CommandePassee   │ {total: 129.99}   ││
│  │ 2  │ cmd-1   │ PaiementReçu     │ {montant: 129.99} ││
│  │ 3  │ cmd-1   │ CommandeExpediee │ {tracking: "XZ1"} ││
│  │ 4  │ cmd-1   │ CommandeLivree   │ {date: "2024-01"} ││
│  └────┴─────────┴──────────────────┴───────────────────┘│
│                                                          │
│  → L'état actuel = rejouer tous les événements.         │
│  → L'historique est complet et immuable.                │
└─────────────────────────────────────────────────────────┘
```

---

## Comment ça marche ?

### 1. Écrire : enregistrer des événements (pas l'état)

```php
class Commande
{
    private CommandeId $id;
    private Statut $statut;
    private array $pendingEvents = [];

    // Constructeur privé - on crée via des méthodes factory
    public static function passer(UtilisateurId $userId, array $lignes): self
    {
        $commande = new self();
        $commande->apply(new CommandePassee(
            commandeId: CommandeId::generate(),
            utilisateurId: $userId,
            lignes: $lignes,
        ));
        return $commande;
    }

    public function annuler(): void
    {
        if (!$this->statut->equals(Statut::EN_COURS)) {
            throw new ImpossibleDAnnulerException();
        }
        $this->apply(new CommandeAnnulee($this->id));
    }

    private function apply(DomainEvent $event): void
    {
        // Modifie l'état local
        match (get_class($event)) {
            CommandePassee::class   => $this->onCommandePassee($event),
            CommandeAnnulee::class  => $this->onCommandeAnnulee($event),
        };
        // Enregistre pour persistance
        $this->pendingEvents[] = $event;
    }

    private function onCommandePassee(CommandePassee $event): void
    {
        $this->id = $event->commandeId;
        $this->statut = Statut::EN_COURS;
    }

    private function onCommandeAnnulee(CommandeAnnulee $event): void
    {
        $this->statut = Statut::ANNULEE;
    }
}
```

### 2. Lire : reconstituer depuis les événements (Replay)

```php
class CommandeRepository
{
    public function findById(CommandeId $id): Commande
    {
        // Charger tous les événements de cet agrégat
        $events = $this->eventStore->loadForAggregate($id);

        // Reconstituer l'état en rejouant les événements
        $commande = new Commande();
        foreach ($events as $event) {
            $commande->apply($event);  // ← sans enregistrer dans pendingEvents
        }
        return $commande;
    }
}
```

---

## Le Snapshot : optimisation du replay

Si un agrégat a des milliers d'événements, rejouer tous les événements à chaque lecture devient coûteux.

```
Solution : Snapshot (photo périodique de l'état)

  Events : [1, 2, 3, 4, ..., 998, 999, 1000]
                                      ▲
                              Snapshot à l'event 1000

  Lecture : Charger snapshot 1000 + rejouer events [1001, 1002, 1003]
            → Au lieu de rejouer 1003 events
```

```php
public function findById(CommandeId $id): Commande
{
    $snapshot = $this->snapshotStore->findLatest($id);

    if ($snapshot !== null) {
        // Reconstituer depuis le snapshot
        $commande = Commande::fromSnapshot($snapshot);
        // Rejouer uniquement les events après le snapshot
        $events = $this->eventStore->loadSince($id, $snapshot->version);
    } else {
        $commande = new Commande();
        $events = $this->eventStore->loadForAggregate($id);
    }

    foreach ($events as $event) {
        $commande->apply($event);
    }
    return $commande;
}
```

---

## Les super-pouvoirs de l'Event Sourcing

### 1. Audit trail parfait

```
"Qui a modifié ce prix ? Quand ? Pourquoi ?"
→ Consultez l'event store : PrixModifie { ancien: 99€, nouveau: 79€, par: user-123, le: 2024-01-10 }
```

### 2. Time Travel (voyage dans le temps)

```php
// "Quel était l'état de cette commande le 15 janvier à 14h30 ?"
$commande = $this->reconstituerJusqua($commandeId, new \DateTime('2024-01-15 14:30'));
```

### 3. Rejouer les événements sur un nouveau modèle

```
Nouveau besoin : "On veut des statistiques par catégorie de produit"
→ Créer une nouvelle Projection
→ Rejouer TOUS les événements depuis le début
→ Populer la nouvelle projection
→ Aucune perte de données !
```

### 4. Debugging

```
Bug en production le 15 janvier à 14h30 ?
→ Récupérer l'état exact de l'agrégat à ce moment précis
→ Reproduire le bug en local avec les mêmes données
```

---

## CQRS : le compagnon naturel de l'Event Sourcing

L'Event Sourcing est souvent couplé avec **CQRS** (Command Query Responsibility Segregation).

```
COMMANDES (écriture)          REQUÊTES (lecture)
─────────────────────         ──────────────────────────────
PasserCommande                 → Projection : liste des commandes
AnnulerCommande                → Projection : tableau de bord
ModifierAdresse                → Projection : historique client

        │                                    ▲
        ▼                                    │
   EVENT STORE ──── events ──► PROJECTIONS ──┘
   (source de vérité)          (vues dénormalisées,
                                optimisées pour la lecture)
```

---

## Les projections (Read Models)

Une projection est une **vue construite à partir des événements**, optimisée pour la lecture.

```php
// Une projection "tableau de bord commandes"
class CommandesDashboardProjector
{
    public function onCommandePassee(CommandePassee $event): void
    {
        $this->db->insert('dashboard_commandes', [
            'commande_id' => $event->commandeId,
            'statut'      => 'en_cours',
            'total'       => $event->total,
            'date'        => $event->occurredAt,
        ]);
    }

    public function onCommandeLivree(CommandeLivree $event): void
    {
        $this->db->update('dashboard_commandes',
            ['statut' => 'livree'],
            ['commande_id' => $event->commandeId]
        );
    }
}
```

---

## Avantages et inconvénients

### Avantages

| Avantage | Valeur |
|---------|--------|
| **Audit trail complet** | Conformité réglementaire, debugging |
| **Time travel** | Reconstituer n'importe quel état passé |
| **Flexibilité des projections** | Créer de nouvelles vues sans migration |
| **Pas de perte de données** | Tout est conservé |
| **Debugging facilité** | Reproduire exactement les bugs en prod |

### Inconvénients

| Inconvénient | Mitigation |
|-------------|-----------|
| **Complexité** | Courbe d'apprentissage importante |
| **Cohérence éventuelle** | Les projections peuvent avoir du lag |
| **Stockage** | L'event store grandit indéfiniment |
| **Schéma évolutif** | Versionning des événements obligatoire |
| **Pas adapté à tout** | CRUD simple n'en a pas besoin |

---

## Versionning des événements

Le plus grand défi opérationnel : les événements sont immuables, mais leur schéma évolue.

```php
// Version 1 de l'événement (ancienne)
{ "type": "CommandePassee", "v": 1, "data": { "total": 99.99 } }

// Version 2 (nouvelle : on a ajouté la devise)
{ "type": "CommandePassee", "v": 2, "data": { "total": 99.99, "devise": "EUR" } }

// Solution : Upcaster
class CommandePasseeUpcaster
{
    public function upcast(array $event): array
    {
        if ($event['v'] === 1) {
            $event['data']['devise'] = 'EUR';  // valeur par défaut
            $event['v'] = 2;
        }
        return $event;
    }
}
```

---

## Quand utiliser l'Event Sourcing ?

```
✅ Event Sourcing est pertinent quand :
  • L'audit trail est une exigence métier (banque, santé, e-commerce)
  • On doit pouvoir reconstituer des états passés
  • Le domaine est complexe avec beaucoup d'événements métier
  • On utilise déjà DDD et EDA

❌ Event Sourcing est surdimensionné pour :
  • Des entités sans historique nécessaire (config, paramètres)
  • Des projets simples sans exigences d'audit
  • Des équipes sans expérience du pattern (complexité opérationnelle élevée)
```

---

→ [Suite : Microservices](./08-microservices.md)
