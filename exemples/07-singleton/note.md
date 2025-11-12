# Singleton Pattern

## Qu'est-ce que c'est ?

Le pattern Singleton garantit qu'une classe n'a qu'une seule instance et fournit un point d'accès global à cette instance.

## Exemple simple

```php
class Database {
    private static ?Database $instance = null;
    
    private function __construct() {}
    
    public static function getInstance(): Database {
        if (self::$instance === null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }
}

$db1 = Database::getInstance();
$db2 = Database::getInstance();
var_dump($db1 === $db2); // true
```

## ⚠️ Anti-pattern important à connaître

Le Singleton est souvent considéré comme un **anti-pattern** car il introduit un état global, rend le code difficile à tester et crée des dépendances cachées. Il est inclus dans ce cours pour que vous compreniez pourquoi il faut l'éviter.

## Problème résolu

Pour une connexion à la base de données ou un système de configuration, on veut s'assurer qu'il n'existe qu'une seule instance partagée dans toute l'application.

## Cas d'utilisation

- Configuration de l'application
- Pool de connexions à la base de données
- Logger centralisé
- Cache partagé
- Gestionnaire de session
- State management (Redux store par exemple)

## Avantages

✅ Une seule instance garantie
✅ Point d'accès global
✅ Initialisation lazy (à la demande)
✅ Économie de ressources

## Inconvénients (nombreux!)

❌ État global difficile à gérer
❌ Rend les tests unitaires très difficiles
❌ Couplage fort dans toute l'application
❌ Viole le principe de responsabilité unique
❌ Masque les dépendances
❌ Problèmes de concurrence en multi-threading
❌ Difficile à hériter ou à étendre

## Alternatives modernes

- **Dependency Injection** : Passer l'instance comme dépendance
- **Module Pattern** : En JavaScript/TypeScript, les modules sont déjà des singletons
- **Context API** en React
- **Services** en Angular

