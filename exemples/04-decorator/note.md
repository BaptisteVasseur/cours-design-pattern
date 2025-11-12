# Decorator Pattern

## Qu'est-ce que c'est ?

Le pattern Decorator permet d'ajouter dynamiquement de nouvelles responsabilités à un objet. Il offre une alternative flexible à l'héritage pour étendre les fonctionnalités.

## Exemple simple

```php
class Pizza implements MenuItem {
    public function getPrice(): float { return 10; }
}

class CheeseDecorator extends MenuItemDecorator {
    public function getPrice(): float {
        return $this->item->getPrice() + 2;
    }
}

$pizza = new Pizza();
$pizza = new CheeseDecorator($pizza);
$pizza = new BaconDecorator($pizza);
echo $pizza->getPrice(); // 10 + 2 + 3 = 15€
```

## Problème résolu

Pour ajouter des options à un plat (extra fromage, sauce, supplément bacon), l'héritage créerait une explosion de classes (PizzaAvecFromage, PizzaAvecFromageEtBacon, etc.). Le Decorator permet d'ajouter ces fonctionnalités dynamiquement.

## Cas d'utilisation

- Ajout d'options aux plats (suppléments, toppings)
- Middleware dans Express.js
- Ajout de fonctionnalités à des streams (compression, encryption)
- Décorateurs de composants UI (avec bordures, ombres, animations)
- Ajout de logs, cache, validation à des services
- HOC (Higher-Order Components) en React

## Avantages

✅ Plus flexible que l'héritage statique
✅ Ajouter/retirer des responsabilités à la volée
✅ Combinaison de comportements sans explosion de classes
✅ Respecte le principe Open/Closed
✅ Responsabilités divisées en petites classes
✅ Composition plutôt qu'héritage

## Inconvénients

❌ Beaucoup de petits objets similaires
❌ Peut rendre le code difficile à déboguer
❌ Configuration complexe avec beaucoup de décorateurs
❌ L'ordre des décorateurs peut être important

