# Factory Pattern

## Qu'est-ce que c'est ?

Le pattern Factory fournit une interface pour créer des objets dans une classe parente, mais permet aux sous-classes de modifier le type d'objets créés. Il encapsule la logique de création d'objets.

## Exemple simple

```php
class RestaurantFactory {
    public function create(string $type): Restaurant {
        return match($type) {
            'italian' => new ItalianRestaurant(),
            'chinese' => new ChineseRestaurant(),
            'french' => new FrenchRestaurant(),
        };
    }
}

$factory = new RestaurantFactory();
$restaurant = $factory->create('italian');
echo $restaurant->getSpecialty(); // "Pizza et Pasta"
```

## Problème résolu

Dans le code initial, la création d'objets (restaurants, utilisateurs, commandes) se fait directement avec des objets littéraux, rendant le code difficile à maintenir et à valider. Pas de validation ni de logique métier centralisée.

## Cas d'utilisation

- Création de différents types de restaurants (fast-food, gastronomique, etc.)
- Génération de documents (PDF, Excel, Word)
- Création de connexions à différentes bases de données
- Instanciation de composants UI selon le thème
- Factory de loggers (console, file, cloud)
- Création d'utilisateurs avec différents rôles

## Avantages

✅ Centralise la logique de création
✅ Facilite l'ajout de nouveaux types d'objets
✅ Respecte le principe de responsabilité unique
✅ Facilite les tests (mocking)
✅ Validation et initialisation cohérente
✅ Masque la complexité de création

## Inconvénients

❌ Peut augmenter la complexité du code
❌ Nécessite de créer de nouvelles classes
❌ Peut être excessif pour des objets simples

