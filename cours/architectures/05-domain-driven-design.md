# Domain-Driven Design (DDD)

> *"Le code doit parler le même langage que le métier."*
> — Eric Evans, *Domain-Driven Design* (2003)

---

## Qu'est-ce que le DDD ?

Le **Domain-Driven Design** est une approche de conception logicielle qui place le **domaine métier** au centre de toutes les décisions techniques. L'idée centrale : si votre code reflète fidèlement le métier, il sera naturellement plus maintenable et plus évolutif.

DDD c'est à la fois :
- Une philosophie de conception
- Un ensemble de patterns tactiques (Entities, Value Objects, Aggregates...)
- Des patterns stratégiques (Bounded Context, Context Map...)

---

## Le problème que DDD résout

```
❌ Sans DDD — le fossé entre métier et technique :

  Métier : "On veut passer une commande avec des lignes, calculer le total
            avec les remises, et envoyer une confirmation par email."

  Code :   class OrderController {
               public function create(Request $r) {
                   $order = new Order();
                   $order->user_id = $r->user;
                   $order->total = 0;
                   foreach ($r->items as $item) {
                       $order->total += $item['price'] * $item['qty'];
                   }
                   $this->db->insert('orders', $order);
                   mail($r->email, "Confirmation", "...");
               }
           }

  → Aucun lien entre le vocabulaire métier et le code.
  → La logique est éparpillée partout.
```

```
✅ Avec DDD — le code parle le même langage :

  $commande = Commande::passer(
      $utilisateur,
      $lignesCommande,
      $politiqueRemise
  );

  $commande->valider();
  → CommandeValidee event déclenché automatiquement
  → L'email est envoyé par un listener métier
```

---

## Le vocabulaire du DDD

### Ubiquitous Language (Langage Omniprésent)

Le premier pilier du DDD. **Développeurs et experts métier utilisent exactement les mêmes mots.**

```
❌ Mauvais : "On va updater le record order dans la table avec le nouveau status"
✅ Bon :     "On va valider la commande"

❌ Mauvais : class ProductItem / class CartEntry / class OrderLine
✅ Bon :     class LigneCommande  (un seul terme pour tout le monde)
```

---

## Les blocs de construction (Building Blocks)

### Entity (Entité)

Un objet qui a une **identité unique** qui persiste dans le temps. Deux entités sont égales si elles ont le même identifiant.

```php
class Commande
{
    private CommandeId $id;     // ← Identité unique
    private Statut $statut;
    private array $lignes;

    // Deux commandes avec le même ID = même commande
    public function equals(Commande $other): bool
    {
        return $this->id->equals($other->id);
    }
}
```

### Value Object (Objet Valeur)

Un objet qui n'a **pas d'identité**. Deux Value Objects sont égaux si tous leurs attributs sont égaux. Ils sont **immuables**.

```php
// ✅ Prix est un Value Object, pas un float !
class Prix
{
    public function __construct(
        private readonly float $montant,
        private readonly string $devise
    ) {
        if ($montant < 0) {
            throw new \InvalidArgumentException('Le prix ne peut pas être négatif');
        }
    }

    public function ajouterTVA(float $taux): self
    {
        // Immuable : on retourne un nouveau Prix
        return new self($this->montant * (1 + $taux), $this->devise);
    }

    public function equals(Prix $other): bool
    {
        return $this->montant === $other->montant
            && $this->devise === $other->devise;
    }
}
```

**Pourquoi ?** Un `float 29.99` ne dit rien. Un `Prix(29.99, 'EUR')` est auto-documenté et auto-validé.

### Aggregate (Agrégat)

Un **cluster d'entités et de Value Objects** qui forment une unité de cohérence. L'**Aggregate Root** est le seul point d'entrée pour modifier le cluster.

```
Aggregate : Commande
                │
        ┌───────┴────────┐
        │                │
  LigneCommande    LigneCommande
  (Produit: X)     (Produit: Y)
  (Qté: 2)         (Qté: 1)

→ On ne modifie jamais une LigneCommande directement.
→ On passe toujours par Commande (l'Aggregate Root).
```

```php
class Commande  // ← Aggregate Root
{
    private array $lignes = [];

    // La seule façon d'ajouter une ligne
    public function ajouterProduit(Produit $produit, int $quantite): void
    {
        // Règle métier : max 10 articles différents par commande
        if (count($this->lignes) >= 10) {
            throw new TropDeLignesException();
        }

        $this->lignes[] = new LigneCommande($produit, $quantite);
    }
}
```

### Domain Event (Événement Domaine)

Quelque chose d'important qui s'est passé dans le domaine. **Nommé au passé.**

```php
class CommandePassee
{
    public function __construct(
        public readonly CommandeId $commandeId,
        public readonly \DateTimeImmutable $occurredAt,
    ) {}
}

// Dans l'Aggregate :
public function passer(): void
{
    $this->statut = Statut::EN_COURS;
    $this->recordEvent(new CommandePassee($this->id, new \DateTimeImmutable()));
}
```

### Repository (Référentiel)

Abstraction de la persistance. On le voit comme une **collection en mémoire** depuis le domaine.

```php
// Dans le Domaine : une interface pure
interface CommandeRepository
{
    public function findById(CommandeId $id): ?Commande;
    public function findByUtilisateur(UtilisateurId $id): array;
    public function save(Commande $commande): void;
}

// Dans l'Infrastructure : l'implémentation concrète
class DoctrineCommandeRepository implements CommandeRepository { ... }
```

### Domain Service (Service Domaine)

La logique métier qui **ne peut pas être placée dans une entité** parce qu'elle concerne plusieurs entités.

```php
// Calcule le prix d'une commande en tenant compte des remises et du catalogue
class CalculateurPrixCommande
{
    public function calculer(Commande $commande, CataloguePrix $catalogue): Montant
    {
        // Logique qui dépend de plusieurs objets du domaine
    }
}
```

---

## Les patterns stratégiques

### Bounded Context (Contexte Délimité)

Un **Bounded Context** est une frontière explicite dans laquelle un modèle de domaine est valide. Le même concept peut avoir des représentations différentes dans des contextes différents.

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│  Contexte Commande  │    │ Contexte Livraison  │    │  Contexte Facturation│
│                     │    │                     │    │                      │
│  Commande           │    │  Livraison          │    │  Facture             │
│  LigneCommande      │    │  Adresse            │    │  LigneFacture        │
│  Produit (id, qté)  │    │  Produit (poids)    │    │  Produit (prix HT)   │
│                     │    │                     │    │                      │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘

→ "Produit" existe dans les 3 contextes mais avec des attributs différents !
→ C'est normal et VOULU.
```

### Context Map (Carte des contextes)

Représentation visuelle des relations entre Bounded Contexts.

```
Catalogue ──────► Commande ──────► Facturation
                      │
                      └──────────► Livraison
                                       │
                                       └──► Logistique (système externe)
```

---

## DDD Léger vs DDD Complet

| | DDD Léger | DDD Complet |
|--|-----------|-------------|
| **Quand** | Domaine pas trop complexe | Domaine très riche et complexe |
| **Ce qu'on utilise** | Value Objects, Entities, Repository | + Aggregates, Domain Events, Bounded Contexts |
| **Complexité** | Faible | Élevée |
| **ROI** | Rapide | Long terme |

---

## Quand utiliser le DDD ?

```
✅ DDD vaut le coût quand :
  • Le domaine métier est complexe (nombreuses règles métier)
  • L'équipe doit collaborer étroitement avec des experts métier
  • Le système va évoluer sur le long terme
  • La codebase dépasse quelques dizaines de milliers de lignes

❌ DDD est surdimensionné pour :
  • Un CRUD simple (formulaires → DB → affichage)
  • Un MVP avec un domaine pas encore défini
  • Une petite app avec peu de logique métier
```

---

## À retenir

> DDD n'est pas un framework ni une bibliothèque. C'est une façon de penser.
> Commencez par les Value Objects et les Entities riches : c'est déjà 80% de la valeur.

---

→ [Suite : Event-Driven Architecture](./06-event-driven-architecture.md)
