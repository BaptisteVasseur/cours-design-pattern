# Strategy Pattern

## Qu'est-ce que c'est ?

Le pattern Strategy permet de définir une famille d'algorithmes, de les encapsuler et de les rendre interchangeables. Il permet de modifier l'algorithme indépendamment des clients qui l'utilisent.

## Exemple simple

```php
interface PricingStrategy {
    public function calculate(float $price): float;
}

class RegularPricing implements PricingStrategy {
    public function calculate(float $price): float {
        return $price;
    }
}

class DiscountPricing implements PricingStrategy {
    public function calculate(float $price): float {
        return $price * 0.9; // 10% de réduction
    }
}

$order = new Order(new DiscountPricing());
$total = $order->calculateTotal(100); // 90€
```

## Problème résolu

Dans le code initial, les différentes stratégies de tarification (premium, gold, standard) et de paiement (carte, PayPal, Apple Pay) sont codées en dur avec des if/else. Cela rend le code difficile à maintenir et à étendre.

## Cas d'utilisation

- Calcul de prix avec différentes réductions (abonnements, codes promo)
- Méthodes de paiement multiples
- Algorithmes de tri/filtrage différents
- Stratégies de livraison (express, standard, économique)
- Compression de fichiers (ZIP, RAR, TAR)

## Avantages

✅ Respect du principe Open/Closed (ouvert à l'extension, fermé à la modification)
✅ Élimination des conditions if/else multiples
✅ Facilite l'ajout de nouvelles stratégies
✅ Les stratégies peuvent être testées indépendamment
✅ Meilleure réutilisation du code

## Inconvénients

❌ Augmente le nombre de classes
❌ Le client doit connaître les différentes stratégies
❌ Peut être excessif pour des algorithmes simples

