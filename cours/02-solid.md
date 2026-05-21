# Les Principes SOLID

> *"SOLID est la fondation sur laquelle reposent tous les bon design patterns et toutes les bonnes architectures."*
> — Robert C. Martin (Uncle Bob)

---

## Qu'est-ce que SOLID ?

**SOLID** est un acronyme regroupant 5 principes de conception orientée objet formulés par Robert C. Martin. Ils guident vers un code :

- **Maintenable** — facile à modifier
- **Extensible** — facile à faire évoluer
- **Testable** — facile à tester unitairement
- **Compréhensible** — facile à lire

```
S → Single Responsibility Principle
O → Open/Closed Principle
L → Liskov Substitution Principle
I → Interface Segregation Principle
D → Dependency Inversion Principle
```

---

## S — Single Responsibility Principle

### "Une classe ne devrait avoir qu'une seule raison de changer."

Autrement dit : **une classe = une responsabilité**.

```php
// ❌ Violation : CommandeService fait tout
class CommandeService
{
    public function passerCommande(array $data): void
    {
        // 1. Valide les données HTTP
        if (empty($data['produits'])) throw new \Exception('Pas de produits');

        // 2. Logique métier
        $total = 0;
        foreach ($data['produits'] as $produit) {
            $total += $produit['prix'] * $produit['qte'];
        }

        // 3. Persistance
        $this->pdo->execute('INSERT INTO commandes (total) VALUES (?)', [$total]);

        // 4. Email
        mail($data['email'], 'Confirmation', 'Votre commande...');

        // 5. Log
        file_put_contents('commandes.log', date('Y-m-d') . " Commande créée\n", FILE_APPEND);
    }
}
// Ce service a 5 raisons de changer !
```

```php
// ✅ Chaque classe a une seule responsabilité
class CommandeController  { /* Valide la requête HTTP */ }
class PasserCommande       { /* Orchestre le use case */ }
class Commande             { /* Logique métier pure */ }
class CommandeRepository   { /* Persistance */ }
class CommandeMailer       { /* Email de confirmation */ }
class CommandeLogger       { /* Logging */ }
```

### Le test mental

> "Pourquoi cette classe changerait-elle ?"
> Si vous trouvez plus d'une raison → violation du SRP.

---

## O — Open/Closed Principle

### "Une classe devrait être ouverte à l'extension mais fermée à la modification."

Vous devriez pouvoir **ajouter des comportements** sans modifier le code existant.

```php
// ❌ Violation : modifier la classe à chaque nouveau type de remise
class CalculateurPrix
{
    public function calculer(Commande $commande, string $typeRemise): float
    {
        $total = $commande->getTotal();

        // ← Si on ajoute un type de remise, on modifie ici (risque de régression)
        if ($typeRemise === 'fidelite') {
            return $total * 0.9;
        } elseif ($typeRemise === 'promo_noel') {
            return $total * 0.8;
        } elseif ($typeRemise === 'vip') {  // ← On a modifié la classe !
            return $total * 0.7;
        }

        return $total;
    }
}
```

```php
// ✅ Extension sans modification
interface PolitiqueRemise
{
    public function appliquer(float $total): float;
}

class RemiseFidelite implements PolitiqueRemise
{
    public function appliquer(float $total): float { return $total * 0.9; }
}

class RemisePromoNoel implements PolitiqueRemise
{
    public function appliquer(float $total): float { return $total * 0.8; }
}

// Nouvelle remise : on AJOUTE une classe, on ne MODIFIE rien d'existant
class RemiseVIP implements PolitiqueRemise
{
    public function appliquer(float $total): float { return $total * 0.7; }
}

class CalculateurPrix
{
    // ← Cette classe ne change plus !
    public function calculer(Commande $commande, PolitiqueRemise $remise): float
    {
        return $remise->appliquer($commande->getTotal());
    }
}
```

---

## L — Liskov Substitution Principle

### "Les sous-classes doivent pouvoir remplacer leurs classes parentes sans changer le comportement attendu du programme."

Si un code fonctionne avec une classe `Animal`, il doit fonctionner de la même façon avec n'importe quelle sous-classe `Chat`, `Chien`...

```php
// ❌ Violation : Rectangle/Carré (le classique)
class Rectangle
{
    protected int $largeur;
    protected int $hauteur;

    public function setLargeur(int $l): void { $this->largeur = $l; }
    public function setHauteur(int $h): void { $this->hauteur = $h; }
    public function aire(): int { return $this->largeur * $this->hauteur; }
}

class Carre extends Rectangle
{
    // Un carré force largeur = hauteur, brisant le contrat de Rectangle !
    public function setLargeur(int $l): void {
        $this->largeur = $l;
        $this->hauteur = $l;  // ← comportement inattendu !
    }
}

// Ce code casse avec Carre :
function testAire(Rectangle $r): void
{
    $r->setLargeur(5);
    $r->setHauteur(10);
    assert($r->aire() === 50);  // ❌ retourne 100 pour un Carré !
}
```

```php
// ✅ Respecter le contrat de la classe parente
// Solution : Carré et Rectangle ne devraient pas avoir de relation d'héritage
// Utiliser une interface commune à la place

interface Forme
{
    public function aire(): float;
}

class Rectangle implements Forme
{
    public function __construct(private float $l, private float $h) {}
    public function aire(): float { return $this->l * $this->h; }
}

class Carre implements Forme
{
    public function __construct(private float $cote) {}
    public function aire(): float { return $this->cote ** 2; }
}
```

### En pratique

```php
// ❌ Violation courante : override qui "désactive" une méthode
class Oiseau
{
    public function voler(): void { /* ... */ }
}

class Pingouin extends Oiseau
{
    public function voler(): void
    {
        throw new \Exception("Un pingouin ne peut pas voler !"); // ← LSP violé
    }
}

// ✅ Modéliser correctement
interface OiseauVolant
{
    public function voler(): void;
}

class Aigle implements OiseauVolant { public function voler(): void { /* ... */ } }
class Pingouin { /* Pas d'interface OiseauVolant */ }
```

---

## I — Interface Segregation Principle

### "Les clients ne devraient pas être forcés de dépendre d'interfaces qu'ils n'utilisent pas."

Préférez **plusieurs petites interfaces spécialisées** à une grosse interface généraliste.

```php
// ❌ Interface trop grosse (God Interface)
interface Animal
{
    public function manger(): void;
    public function dormir(): void;
    public function voler(): void;   // ← Les poissons n'ont pas besoin de ça
    public function nager(): void;   // ← Les oiseaux terrestres non plus
    public function courir(): void;
}

class Dauphin implements Animal
{
    public function manger(): void { /* ... */ }
    public function dormir(): void { /* ... */ }
    public function voler(): void { throw new \Exception("Non applicable"); } // ❌
    public function nager(): void { /* ... */ }
    public function courir(): void { throw new \Exception("Non applicable"); } // ❌
}
```

```php
// ✅ Interfaces ségrégées
interface Mangeable   { public function manger(): void; }
interface Dormable    { public function dormir(): void; }
interface Volant      { public function voler(): void; }
interface Nageur      { public function nager(): void; }
interface Coureur     { public function courir(): void; }

class Dauphin implements Mangeable, Dormable, Nageur
{
    public function manger(): void { /* ... */ }
    public function dormir(): void { /* ... */ }
    public function nager(): void  { /* ... */ }
}

class Aigle implements Mangeable, Dormable, Volant, Coureur
{
    public function manger(): void { /* ... */ }
    public function dormir(): void { /* ... */ }
    public function voler(): void  { /* ... */ }
    public function courir(): void { /* ... */ }
}
```

### En pratique avec les Repositories

```php
// ❌ Interface trop large
interface CommandeRepository
{
    public function findById(string $id): ?Commande;
    public function findAll(): array;
    public function save(Commande $c): void;
    public function delete(Commande $c): void;
    public function findByDate(\DateTime $d): array;
    public function findByClient(string $clientId): array;
    public function countByStatut(string $statut): int;
    public function exportCsv(): string;  // ← Vraiment dans un Repository ?
}

// ✅ Interfaces ségrégées par besoin
interface CommandeReadRepository
{
    public function findById(CommandeId $id): ?Commande;
    public function findByClient(UtilisateurId $id): array;
}

interface CommandeWriteRepository
{
    public function save(Commande $commande): void;
}

interface CommandeStatsRepository
{
    public function countByStatut(Statut $statut): int;
    public function caParMois(): array;
}
```

---

## D — Dependency Inversion Principle

### "Dépendre des abstractions, pas des concrétions."

C'est le principe le plus puissant, fondement de l'architecture hexagonale.

```
❌ Dépendance vers le concret (couplage fort) :
   UseCase ──────────────────────────────► DoctrineRepository
   (domaine)                               (infrastructure)

   Le domaine dépend de Doctrine ! Impossible de tester sans DB.

✅ Inversion de dépendance (couplage faible) :
   UseCase ──────────────────────────────► RepositoryInterface
   (domaine)          définit ↑            (abstraction, domaine)
                                                    ▲
   DoctrineRepository ─────────────────────────────┘
   (infrastructure)             implémente
```

```php
// ❌ Violation : dépendance directe vers une implémentation concrète
class PasserCommande
{
    private DoctrineCommandeRepository $repo; // ← Couplage direct !

    public function __construct()
    {
        // On instancie directement la dépendance
        $this->repo = new DoctrineCommandeRepository(/* ... */);
    }

    public function execute(array $data): void
    {
        $commande = new Commande($data);
        $this->repo->save($commande);
    }
}
```

```php
// ✅ Inversion : dépendance vers une abstraction, injectée
interface CommandeRepository  // ← Abstraction (définie dans le Domaine)
{
    public function save(Commande $commande): void;
}

class PasserCommande
{
    // Dépend de l'interface, pas de l'implémentation
    public function __construct(
        private readonly CommandeRepository $commandeRepository,
    ) {}

    public function execute(PasserCommandeInput $input): void
    {
        $commande = Commande::passer($input);
        $this->commandeRepository->save($commande);
    }
}

// En production : injecter Doctrine
$service = new PasserCommande(new DoctrineCommandeRepository($em));

// En test : injecter un fake
$service = new PasserCommande(new InMemoryCommandeRepository());
```

---

## Récapitulatif SOLID

```
┌───────────────────────────────────────────────────────────────────────┐
│                           SOLID                                        │
├───┬───────────────────────────────────────────────────────────────────┤
│ S │ Single Responsibility  → Une classe = une raison de changer       │
│   │ Symptôme de violation : classe qui fait trop de choses            │
├───┼───────────────────────────────────────────────────────────────────┤
│ O │ Open/Closed            → Étendre sans modifier                    │
│   │ Symptôme de violation : if/switch sur des types pour les features │
├───┼───────────────────────────────────────────────────────────────────┤
│ L │ Liskov Substitution    → Les sous-classes respectent le contrat   │
│   │ Symptôme de violation : méthodes qui lèvent "Non implémenté"     │
├───┼───────────────────────────────────────────────────────────────────┤
│ I │ Interface Segregation  → Interfaces petites et spécialisées       │
│   │ Symptôme de violation : implémentations vides de certaines        │
│   │                          méthodes d'interface                      │
├───┼───────────────────────────────────────────────────────────────────┤
│ D │ Dependency Inversion   → Dépendre des abstractions                │
│   │ Symptôme de violation : `new ConcreteClass()` dans les services   │
└───┴───────────────────────────────────────────────────────────────────┘
```

---

## SOLID dans les architectures

Les principes SOLID ne sont pas isolés — ils se retrouvent dans chaque architecture :

| Architecture | SOLID en action |
|-------------|----------------|
| Architecture en couches | **SRP** : chaque couche a une responsabilité |
| Architecture hexagonale | **DIP** : le domaine dépend d'interfaces |
| DDD | **SRP** + **OCP** : les Aggregates encapsulent, les Events étendent |
| Microservices | **SRP** au niveau service |
| Event-Driven | **OCP** : ajouter un listener sans modifier le producer |

---

→ [Suite : Les Design Patterns](./03-design-patterns.md)
