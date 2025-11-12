# Principes SOLID

- https://aperraudeau.medium.com/les-principes-solid-cbc36b6a0da0
- https://refactoring.guru/fr/design-patterns/catalog

## Qu'est-ce que c'est ?

SOLID est un acronyme représentant 5 principes fondamentaux de la programmation orientée objet et de la conception logicielle. Ces principes rendent le code plus maintenable, flexible et évolutif.

## Les 5 Principes

### 1. **S** - Single Responsibility Principle (SRP)
> Une classe ne devrait avoir qu'une seule raison de changer.

Chaque classe doit avoir une seule responsabilité. Dans le code initial, `UserManager` fait tout : validation, sauvegarde, notifications, génération de rapports, calcul de remises.

**Après :** Chaque classe a une responsabilité unique :
- `UserValidator` : validation des données
- `UserRepository` : persistance des données
- `NotificationService` : envoi de notifications
- `ReportGenerator` : génération de rapports
- `DiscountCalculator` : calcul des remises

### 2. **O** - Open/Closed Principle (OCP)
> Les entités logicielles doivent être ouvertes à l'extension mais fermées à la modification.

Le code doit pouvoir être étendu sans modifier le code existant.

**Avant :** Pour ajouter un nouveau type de notification, il faut modifier la méthode `notifyUser()` avec un nouveau `elseif`.

**Après :** On crée simplement une nouvelle classe implémentant `NotificationInterface` (ex: `SlackNotification`).

### 3. **L** - Liskov Substitution Principle (LSP)
> Les objets d'une classe dérivée doivent pouvoir remplacer les objets de la classe de base sans altérer le comportement du programme.

Une classe enfant doit pouvoir remplacer sa classe parente sans casser l'application.

**Après :** On peut remplacer `DatabaseUserRepository` par `InMemoryUserRepository` sans modifier `UserService`. Les deux implémentent `UserRepositoryInterface` correctement.

### 4. **I** - Interface Segregation Principle (ISP)
> Les clients ne doivent pas être forcés de dépendre d'interfaces qu'ils n'utilisent pas.

Il vaut mieux plusieurs petites interfaces spécifiques qu'une grosse interface générale.

**Après :** 
- `NotificationInterface` : uniquement pour envoyer
- `NotificationLoggerInterface` : uniquement pour logger
- `ExporterInterface` : uniquement pour exporter

Au lieu d'une grosse interface avec toutes les méthodes.

### 5. **D** - Dependency Inversion Principle (DIP)
> Les modules de haut niveau ne doivent pas dépendre des modules de bas niveau. Les deux doivent dépendre d'abstractions.

Les classes doivent dépendre d'abstractions (interfaces) et non de classes concrètes.

**Avant :** `UserManager` crée directement une instance de `PDO` dans son constructeur (dépendance forte).

**Après :** `UserService` dépend de `UserRepositoryInterface` et `UserValidatorInterface` (abstractions) injectées via le constructeur.

## Problèmes résolus

Le code initial présente plusieurs problèmes :

❌ **Classe God Object** : `UserManager` fait trop de choses
❌ **Couplage fort** : Dépendances directes à PDO, impossible de tester
❌ **Difficile à étendre** : Ajout d'une fonctionnalité = modification du code existant
❌ **Code dupliqué** : Logique similaire éparpillée
❌ **Testabilité faible** : Impossible de mocker les dépendances

## Avantages SOLID

✅ **Maintenabilité** : Code plus facile à comprendre et modifier
✅ **Testabilité** : Chaque classe peut être testée indépendamment
✅ **Réutilisabilité** : Les composants sont facilement réutilisables
✅ **Flexibilité** : Facile d'ajouter de nouvelles fonctionnalités
✅ **Découplage** : Les classes sont indépendantes les unes des autres

## Cas d'utilisation

Les principes SOLID s'appliquent à tous les projets orientés objet :

- Applications web (API, services)
- Systèmes de gestion complexes
- Frameworks et bibliothèques
- Microservices
- Applications nécessitant des tests unitaires

## Exemple concret

```php
// ❌ Violation de SOLID
class User {
    public function save() {
        // Connexion DB directe
        $db = new PDO(...);
        $db->query("INSERT...");
    }
}

// ✅ Respect de SOLID
interface UserRepositoryInterface {
    public function save(User $user): void;
}

class DatabaseUserRepository implements UserRepositoryInterface {
    public function __construct(private PDO $db) {}
    
    public function save(User $user): void {
        $this->db->query("INSERT...");
    }
}

class UserService {
    public function __construct(
        private UserRepositoryInterface $repository
    ) {}
    
    public function createUser(User $user): void {
        $this->repository->save($user);
    }
}
```

## Bonnes pratiques

1. **Commencer petit** : N'appliquez pas tous les principes d'un coup
2. **Injection de dépendances** : Injectez les dépendances via le constructeur
3. **Interfaces** : Utilisez des interfaces pour définir les contrats
4. **Composition over Inheritance** : Privilégiez la composition à l'héritage
5. **Tests** : Écrivez des tests pour valider votre conception

## Attention

⚠️ Ne pas sur-ingénierer : SOLID ne signifie pas créer une classe pour chaque ligne de code
⚠️ Trouver le bon équilibre entre simplicité et architecture
⚠️ Adapter les principes au contexte de votre projet


