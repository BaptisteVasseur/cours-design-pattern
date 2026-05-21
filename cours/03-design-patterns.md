# Les Design Patterns

> *"Chaque pattern décrit un problème récurrent dans notre environnement, ainsi que le cœur de sa solution, de façon à ce qu'on puisse utiliser cette solution des millions de fois."*
> — Christopher Alexander

---

## Introduction

Les **Design Patterns** (patrons de conception) sont des **solutions éprouvées à des problèmes récurrents** en conception logicielle orientée objet. Ils ont été popularisés par le livre **"Design Patterns: Elements of Reusable Object-Oriented Software"** (1994), dit le livre du **Gang of Four (GoF)**.

### Les 3 catégories

```
┌───────────────────────────────────────────────────────────────────┐
│                      DESIGN PATTERNS                               │
├─────────────────┬───────────────────────┬─────────────────────────┤
│  CRÉATIONNELS   │    STRUCTURELS        │   COMPORTEMENTAUX       │
│                 │                       │                         │
│ Comment créer   │ Comment assembler     │ Comment les objets      │
│ des objets ?    │ des objets ?          │ communiquent-ils ?      │
│                 │                       │                         │
│ • Singleton     │ • Adapter             │ • Observer              │
│ • Factory       │ • Decorator           │ • Strategy              │
│ • Builder       │ • Facade              │ • Command               │
│ • Prototype     │ • Proxy               │ • Chain of Resp.        │
│ • Abstract Fact │ • Composite           │ • Template Method       │
│                 │ • Bridge              │ • State                 │
│                 │                       │ • Iterator              │
└─────────────────┴───────────────────────┴─────────────────────────┘
```

---

## PARTIE 1 — Patterns Créationnels

---

### Singleton

**Garantir qu'une classe n'a qu'une seule instance et fournir un point d'accès global.**

```php
class Configuration
{
    private static ?self $instance = null;
    private array $config = [];

    private function __construct() // ← privé : interdit le `new`
    {
        $this->config = parse_ini_file('config.ini');
    }

    public static function getInstance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function get(string $key): mixed
    {
        return $this->config[$key] ?? null;
    }
}

// Usage
$config = Configuration::getInstance();
$db = Configuration::getInstance(); // ← même instance !
```

**Quand l'utiliser ?**
- Configuration globale de l'application
- Pool de connexions à la DB
- Logger

**⚠️ Attention** : Le Singleton rend le code difficile à tester (état global partagé). Préférer l'injection de dépendances quand possible.

---

### Factory Method

**Définir une interface pour créer un objet, mais laisser les sous-classes décider quelle classe instancier.**

```php
// Problème : comment créer le bon type de notification selon le canal ?

interface Notification
{
    public function envoyer(string $message, string $destinataire): void;
}

class EmailNotification implements Notification
{
    public function envoyer(string $message, string $destinataire): void
    {
        // Envoi email
    }
}

class SmsNotification implements Notification
{
    public function envoyer(string $message, string $destinataire): void
    {
        // Envoi SMS
    }
}

class PushNotification implements Notification
{
    public function envoyer(string $message, string $destinataire): void
    {
        // Notification push
    }
}

// La Factory
class NotificationFactory
{
    public static function create(string $canal): Notification
    {
        return match ($canal) {
            'email' => new EmailNotification(),
            'sms'   => new SmsNotification(),
            'push'  => new PushNotification(),
            default => throw new \InvalidArgumentException("Canal inconnu: $canal"),
        };
    }
}

// Usage
$notif = NotificationFactory::create('email');
$notif->envoyer('Votre commande est confirmée', 'user@example.com');
```

**Quand l'utiliser ?** : Quand la création d'un objet est complexe ou quand le type exact n'est connu qu'à l'exécution.

---

### Builder

**Construire un objet complexe étape par étape.**

```php
// Problème : un objet avec beaucoup de paramètres optionnels

// ❌ Anti-pattern "telescoping constructor"
new Commande($id, $client, $produits, $adresse, $livraison, $paiement, $remise, $note, ...);

// ✅ Builder
class CommandeBuilder
{
    private UtilisateurId $clientId;
    private array $lignes = [];
    private ?Adresse $adresseLivraison = null;
    private ?ModeLivraison $modeLivraison = null;
    private ?PolitiqueRemise $remise = null;

    public function pourClient(UtilisateurId $id): self
    {
        $this->clientId = $id;
        return $this;
    }

    public function avecProduit(Produit $produit, int $qte): self
    {
        $this->lignes[] = new LigneCommande($produit, $qte);
        return $this;
    }

    public function livrerA(Adresse $adresse): self
    {
        $this->adresseLivraison = $adresse;
        return $this;
    }

    public function avecRemise(PolitiqueRemise $remise): self
    {
        $this->remise = $remise;
        return $this;
    }

    public function build(): Commande
    {
        if (empty($this->lignes)) {
            throw new \LogicException('Une commande doit avoir au moins une ligne');
        }
        return new Commande($this->clientId, $this->lignes, $this->adresseLivraison, $this->remise);
    }
}

// Usage (fluent interface)
$commande = (new CommandeBuilder())
    ->pourClient($userId)
    ->avecProduit($produit1, 2)
    ->avecProduit($produit2, 1)
    ->livrerA($adresse)
    ->avecRemise(new RemiseFidelite())
    ->build();
```

**Quand l'utiliser ?** : Objets avec beaucoup de paramètres optionnels, construction en plusieurs étapes.

---

### Prototype

**Cloner un objet existant plutôt que d'en créer un nouveau.**

```php
interface Cloneable
{
    public function clone(): static;
}

class ConfigurationTemplate implements Cloneable
{
    private array $parametres;

    public function __construct(array $parametres)
    {
        $this->parametres = $parametres;
    }

    public function clone(): static
    {
        return clone $this; // PHP gère la copie superficielle
    }

    public function set(string $key, mixed $value): void
    {
        $this->parametres[$key] = $value;
    }
}

// Usage : partir d'un template et personnaliser
$templateProd = new ConfigurationTemplate(['debug' => false, 'cache' => true]);
$configFr = $templateProd->clone();
$configFr->set('locale', 'fr_FR');
```

---

## PARTIE 2 — Patterns Structurels

---

### Adapter

**Convertir l'interface d'une classe en une autre interface attendue par le client.**

```php
// Scénario : on utilise une librairie externe de paiement qui a sa propre interface

// Interface attendue par notre application
interface PaymentGateway
{
    public function charge(int $montantCentimes, string $devise, string $token): bool;
}

// Librairie externe Stripe (interface différente)
class StripeClient // ← code tiers, on ne peut pas le modifier
{
    public function createCharge(array $params): array
    {
        // API Stripe
        return ['status' => 'succeeded', 'id' => 'ch_xxx'];
    }
}

// L'Adapter : adapte Stripe à notre interface
class StripeAdapter implements PaymentGateway
{
    public function __construct(private StripeClient $stripe) {}

    public function charge(int $montantCentimes, string $devise, string $token): bool
    {
        $result = $this->stripe->createCharge([
            'amount'   => $montantCentimes,
            'currency' => strtolower($devise),
            'source'   => $token,
        ]);

        return $result['status'] === 'succeeded';
    }
}

// Notre code utilise l'interface commune
class PaiementService
{
    public function __construct(private PaymentGateway $gateway) {}

    public function payer(Commande $commande, string $token): void
    {
        $this->gateway->charge($commande->totalCentimes(), 'EUR', $token);
    }
}

// Changer de Stripe à Braintree = juste changer l'adapter, pas le PaiementService
```

**Quand l'utiliser ?** : Intégration de librairies tierces, migration d'un système à un autre.

---

### Decorator

**Ajouter dynamiquement des responsabilités à un objet, sans modifier la classe.**

```php
// Interface de base
interface Logger
{
    public function log(string $message): void;
}

class ConsoleLogger implements Logger
{
    public function log(string $message): void
    {
        echo $message . PHP_EOL;
    }
}

// Decorator : ajoute des timestamps
class TimestampLogger implements Logger
{
    public function __construct(private Logger $logger) {}

    public function log(string $message): void
    {
        $this->logger->log('[' . date('Y-m-d H:i:s') . '] ' . $message);
    }
}

// Decorator : ajoute un préfixe de niveau
class LevelLogger implements Logger
{
    public function __construct(
        private Logger $logger,
        private string $level,
    ) {}

    public function log(string $message): void
    {
        $this->logger->log("[{$this->level}] $message");
    }
}

// On compose les decorators
$logger = new TimestampLogger(
    new LevelLogger(
        new ConsoleLogger(),
        'INFO'
    )
);

$logger->log('Commande créée');
// Output : [2024-01-15 10:30:00] [INFO] Commande créée
```

**Quand l'utiliser ?** : Ajouter des comportements transversaux (logging, cache, sécurité) sans toucher à la classe originale.

---

### Facade

**Fournir une interface simplifiée à un sous-système complexe.**

```php
// Sous-système complexe
class StockService    { public function reserver(array $produits): void {} }
class PaiementService { public function debiter(float $montant): bool { return true; } }
class LivraisonService{ public function planifier(Commande $c): void {} }
class EmailService    { public function envoyer(string $to, string $msg): void {} }
class AnalyticsService{ public function track(string $event): void {} }

// La Facade : une interface simple pour un cas d'usage complexe
class CommandeFacade
{
    public function __construct(
        private StockService $stock,
        private PaiementService $paiement,
        private LivraisonService $livraison,
        private EmailService $email,
        private AnalyticsService $analytics,
    ) {}

    // Un seul appel qui orchestre tout
    public function passerCommande(UtilisateurId $userId, array $produits): Commande
    {
        $commande = Commande::passer($userId, $produits);

        $this->stock->reserver($produits);
        $this->paiement->debiter($commande->total());
        $this->livraison->planifier($commande);
        $this->email->envoyer($userId->email(), 'Confirmation...');
        $this->analytics->track('commande.passee');

        return $commande;
    }
}

// Le client n'interagit qu'avec la Facade
$facade = new CommandeFacade($stock, $paiement, $livraison, $email, $analytics);
$commande = $facade->passerCommande($userId, $produits);
```

---

### Proxy

**Contrôler l'accès à un objet via un substitut.**

```php
// Proxy de cache : évite d'aller en DB si les données sont en cache
interface ProduitRepository
{
    public function findById(string $id): ?Produit;
}

class DoctrineProduitRepository implements ProduitRepository
{
    public function findById(string $id): ?Produit
    {
        // Requête SQL
        return $this->em->find(Produit::class, $id);
    }
}

class CachedProduitRepository implements ProduitRepository
{
    private array $cache = [];

    public function __construct(private ProduitRepository $repo) {}

    public function findById(string $id): ?Produit
    {
        if (!isset($this->cache[$id])) {
            $this->cache[$id] = $this->repo->findById($id);
        }
        return $this->cache[$id];
    }
}

// Décorer le repo avec le cache (transparent pour le client)
$repo = new CachedProduitRepository(new DoctrineProduitRepository($em));
```

---

### Composite

**Traiter uniformément un objet seul et une composition d'objets.**

```php
// Cas d'usage : menu de navigation avec des items et des sous-menus

interface MenuItem
{
    public function render(int $depth = 0): string;
}

class SimpleMenuItem implements MenuItem
{
    public function __construct(
        private string $label,
        private string $url,
    ) {}

    public function render(int $depth = 0): string
    {
        return str_repeat('  ', $depth) . "<a href='{$this->url}'>{$this->label}</a>";
    }
}

class MenuGroup implements MenuItem
{
    private array $children = [];

    public function __construct(private string $label) {}

    public function add(MenuItem $item): void
    {
        $this->children[] = $item;
    }

    public function render(int $depth = 0): string
    {
        $html = str_repeat('  ', $depth) . "<div>{$this->label}</div>\n";
        foreach ($this->children as $child) {
            $html .= $child->render($depth + 1) . "\n";
        }
        return $html;
    }
}

// Usage
$menu = new MenuGroup('Navigation');
$menu->add(new SimpleMenuItem('Accueil', '/'));

$catalogue = new MenuGroup('Catalogue');
$catalogue->add(new SimpleMenuItem('Électronique', '/electronique'));
$catalogue->add(new SimpleMenuItem('Vêtements', '/vetements'));

$menu->add($catalogue);
$menu->add(new SimpleMenuItem('Contact', '/contact'));

echo $menu->render(); // Récursif, traite tout uniformément
```

---

## PARTIE 3 — Patterns Comportementaux

---

### Observer

**Définir une dépendance un-à-plusieurs : quand un objet change d'état, tous ses abonnés sont notifiés automatiquement.**

```php
// Le cœur de l'Event-Driven Architecture !

interface Observer
{
    public function update(string $event, mixed $data): void;
}

class EventEmitter
{
    private array $listeners = [];

    public function on(string $event, Observer $observer): void
    {
        $this->listeners[$event][] = $observer;
    }

    protected function emit(string $event, mixed $data = null): void
    {
        foreach ($this->listeners[$event] ?? [] as $observer) {
            $observer->update($event, $data);
        }
    }
}

class Commande extends EventEmitter
{
    public function valider(): void
    {
        $this->statut = Statut::VALIDEE;
        $this->emit('commande.validee', $this); // ← Notifie tous les observers
    }
}

// Les observers
class EmailObserver implements Observer
{
    public function update(string $event, mixed $data): void
    {
        if ($event === 'commande.validee') {
            // Envoyer email
        }
    }
}

class StockObserver implements Observer
{
    public function update(string $event, mixed $data): void
    {
        if ($event === 'commande.validee') {
            // Réserver le stock
        }
    }
}

// Usage
$commande = new Commande();
$commande->on('commande.validee', new EmailObserver());
$commande->on('commande.validee', new StockObserver());
$commande->valider(); // ← Email et stock notifiés automatiquement
```

---

### Strategy

**Définir une famille d'algorithmes, les encapsuler et les rendre interchangeables.**

```php
// On l'a vu avec SOLID/OCP — voici l'implémentation complète

interface AlgorithmeTriProduits
{
    public function trier(array &$produits): void;
}

class TriParPrixCroissant implements AlgorithmeTriProduits
{
    public function trier(array &$produits): void
    {
        usort($produits, fn($a, $b) => $a->prix <=> $b->prix);
    }
}

class TriParPopularite implements AlgorithmeTriProduits
{
    public function trier(array &$produits): void
    {
        usort($produits, fn($a, $b) => $b->ventes <=> $a->ventes);
    }
}

class TriParNouveaute implements AlgorithmeTriProduits
{
    public function trier(array &$produits): void
    {
        usort($produits, fn($a, $b) => $b->createdAt <=> $a->createdAt);
    }
}

class CatalogueProduits
{
    private AlgorithmeTriProduits $strategie;

    public function setStrategie(AlgorithmeTriProduits $strategie): void
    {
        $this->strategie = $strategie;
    }

    public function getProduits(): array
    {
        $produits = $this->repository->findAll();
        $this->strategie->trier($produits);
        return $produits;
    }
}

// Changer d'algorithme à l'exécution
$catalogue->setStrategie(new TriParPopularite());
$produitsParPop = $catalogue->getProduits();

$catalogue->setStrategie(new TriParPrixCroissant());
$produitsParPrix = $catalogue->getProduits();
```

---

### Command

**Encapsuler une requête sous forme d'objet, permettant de paramétrer des actions, les mettre en file ou les annuler.**

```php
interface Commande   // (ici "Commande" = Command pattern, pas domaine métier !)
{
    public function execute(): void;
    public function undo(): void;
}

class ModifierPrixCommand implements Commande
{
    private float $ancienPrix;

    public function __construct(
        private Produit $produit,
        private float $nouveauPrix,
    ) {}

    public function execute(): void
    {
        $this->ancienPrix = $this->produit->getPrix();
        $this->produit->setPrix($this->nouveauPrix);
    }

    public function undo(): void
    {
        $this->produit->setPrix($this->ancienPrix);
    }
}

// Historique des commandes (undo/redo)
class HistoriqueCommandes
{
    private array $historique = [];

    public function executer(Commande $commande): void
    {
        $commande->execute();
        $this->historique[] = $commande;
    }

    public function annuler(): void
    {
        $commande = array_pop($this->historique);
        $commande?->undo();
    }
}

// Usage
$historique = new HistoriqueCommandes();
$historique->executer(new ModifierPrixCommand($produit, 79.99));
$historique->executer(new ModifierPrixCommand($produit, 69.99));
$historique->annuler(); // → Prix revient à 79.99
```

---

### Chain of Responsibility

**Passer une requête le long d'une chaîne de handlers. Chaque handler décide de traiter ou de passer au suivant.**

```php
abstract class ValidationHandler
{
    private ?ValidationHandler $next = null;

    public function setNext(ValidationHandler $handler): ValidationHandler
    {
        $this->next = $handler;
        return $handler;
    }

    protected function passAuSuivant(Commande $commande): void
    {
        $this->next?->valider($commande);
    }

    abstract public function valider(Commande $commande): void;
}

class StockValidationHandler extends ValidationHandler
{
    public function valider(Commande $commande): void
    {
        foreach ($commande->getLignes() as $ligne) {
            if ($ligne->getProduit()->getStock() < $ligne->getQuantite()) {
                throw new StockInsuffisantException();
            }
        }
        $this->passAuSuivant($commande);
    }
}

class PaiementValidationHandler extends ValidationHandler
{
    public function valider(Commande $commande): void
    {
        if (!$commande->getClient()->aPaiementValide()) {
            throw new PaiementInvalideException();
        }
        $this->passAuSuivant($commande);
    }
}

class AdresseValidationHandler extends ValidationHandler
{
    public function valider(Commande $commande): void
    {
        if ($commande->getAdresse() === null) {
            throw new AdresseManquanteException();
        }
        $this->passAuSuivant($commande);
    }
}

// Construire la chaîne
$stockHandler = new StockValidationHandler();
$paiementHandler = new PaiementValidationHandler();
$adresseHandler = new AdresseValidationHandler();

$stockHandler->setNext($paiementHandler)->setNext($adresseHandler);

$stockHandler->valider($commande); // Parcourt toute la chaîne
```

---

### Template Method

**Définir le squelette d'un algorithme dans une classe de base, en laissant les sous-classes remplir certaines étapes.**

```php
abstract class ExporteurCommandes
{
    // Le squelette de l'algorithme (Template Method)
    final public function exporter(array $commandes): string
    {
        $data = $this->preparer($commandes);
        $contenu = $this->formater($data);
        return $this->finaliser($contenu);
    }

    // Étapes communes
    private function preparer(array $commandes): array
    {
        return array_map(fn($c) => [
            'id'    => $c->getId(),
            'total' => $c->getTotal(),
            'date'  => $c->getDate()->format('Y-m-d'),
        ], $commandes);
    }

    // Étapes à implémenter par les sous-classes
    abstract protected function formater(array $data): string;

    // Étape avec comportement par défaut (hook)
    protected function finaliser(string $contenu): string
    {
        return $contenu;
    }
}

class ExporteurCsv extends ExporteurCommandes
{
    protected function formater(array $data): string
    {
        $lines = ['id,total,date'];
        foreach ($data as $row) {
            $lines[] = implode(',', $row);
        }
        return implode("\n", $lines);
    }
}

class ExporteurJson extends ExporteurCommandes
{
    protected function formater(array $data): string
    {
        return json_encode($data, JSON_PRETTY_PRINT);
    }
}

// Usage
$exporteurCsv = new ExporteurCsv();
$csv = $exporteurCsv->exporter($commandes);
```

---

### State

**Permettre à un objet de modifier son comportement quand son état interne change. L'objet semble changer de classe.**

```php
interface EtatCommande
{
    public function valider(Commande $commande): void;
    public function expedier(Commande $commande): void;
    public function annuler(Commande $commande): void;
    public function getNom(): string;
}

class EtatEnCours implements EtatCommande
{
    public function valider(Commande $commande): void
    {
        $commande->changerEtat(new EtatValidee());
    }

    public function expedier(Commande $commande): void
    {
        throw new TransitionInterditeException("Valider d'abord");
    }

    public function annuler(Commande $commande): void
    {
        $commande->changerEtat(new EtatAnnulee());
    }

    public function getNom(): string { return 'en_cours'; }
}

class EtatValidee implements EtatCommande
{
    public function valider(Commande $commande): void
    {
        throw new TransitionInterditeException("Déjà validée");
    }

    public function expedier(Commande $commande): void
    {
        $commande->changerEtat(new EtatExpediee());
    }

    public function annuler(Commande $commande): void
    {
        $commande->changerEtat(new EtatAnnulee());
    }

    public function getNom(): string { return 'validee'; }
}

class Commande
{
    private EtatCommande $etat;

    public function __construct()
    {
        $this->etat = new EtatEnCours();
    }

    public function valider(): void   { $this->etat->valider($this); }
    public function expedier(): void  { $this->etat->expedier($this); }
    public function annuler(): void   { $this->etat->annuler($this); }

    public function changerEtat(EtatCommande $etat): void
    {
        $this->etat = $etat;
    }
}
```

---

## Récapitulatif : quand utiliser quel pattern ?

```
PROBLÈME                                    PATTERN
──────────────────────────────────────────────────────────────────────
"J'ai besoin d'une seule instance"          → Singleton
"Je crée différents types d'objets"         → Factory Method
"Je construis un objet complexe étape/étape"→ Builder
"Je veux adapter une interface tierce"      → Adapter
"J'ajoute des comportements sans modifier"  → Decorator
"Je simplifie un système complexe"          → Facade
"Je contrôle l'accès à un objet"            → Proxy
"Je traite des arbres d'objets"             → Composite
"Je notifie plusieurs objets d'un changement"→ Observer
"Je change d'algorithme à l'exécution"      → Strategy
"J'encapsule une action pour undo/queue"    → Command
"Je valide en plusieurs étapes chainées"    → Chain of Responsibility
"Je définis un squelette avec des étapes"   → Template Method
"Le comportement dépend de l'état interne"  → State
```

---

## Patterns et architectures : les liens

| Pattern | Utilisé dans |
|---------|-------------|
| Observer | EDA, Symfony EventDispatcher, Domain Events |
| Strategy | Politique de remise (DDD), algorithmes interchangeables |
| Command | CQRS, Symfony Messenger, undo/redo |
| Facade | Use Cases (DDD), API Gateway (Microservices) |
| Adapter | Architecture Hexagonale (Adapters) |
| Decorator | Middleware HTTP, logging, caching |
| Repository | DDD, Architecture en couches |
| Factory | Création d'entités complexes |
| Builder | Test Data Builders, construction d'objets de domaine |
| State | Machines à états (statut commande, workflow) |
| Proxy | Cache, sécurité, lazy loading |

---

→ Retour au [sommaire](./README.md)
