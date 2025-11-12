# Facade Pattern

## Qu'est-ce que c'est ?

Le pattern Facade fournit une interface unifiée et simplifiée pour un ensemble d'interfaces dans un sous-système. Il définit une interface de plus haut niveau qui rend le sous-système plus facile à utiliser.

## Exemple simple

```php
class OrderFacade {
    public function placeOrder(array $items): void {
        $this->inventory->reserve($items);
        $this->payment->process($items);
        $this->delivery->schedule($items);
        $this->notification->send($items);
    }
}

// Au lieu de gérer 4 systèmes :
$facade = new OrderFacade();
$facade->placeOrder($items); // Simple !
```

## Problème résolu

Commander un repas nécessite de coordonner plusieurs systèmes (validation, paiement, notifications, gestion de stock, etc.). Le Facade simplifie cette complexité en offrant une seule méthode `placeOrder()`.

## Cas d'utilisation

- Simplification d'APIs complexes de librairies tierces
- Interface unifiée pour un système de paiement (Stripe, PayPal, etc.)
- Wrapper autour de plusieurs microservices
- Simplification d'opérations multi-étapes
- SDKs qui masquent la complexité d'une API REST
- jQuery comme facade pour DOM manipulation

## Avantages

✅ Simplifie l'utilisation d'un système complexe
✅ Réduit les dépendances entre clients et sous-systèmes
✅ Facilite les tests (on peut mocker la facade)
✅ Point d'entrée unique et clair
✅ Isole le code complexe du reste de l'application
✅ Facile à maintenir et à documenter

## Inconvénients

❌ Peut devenir un "god object" si trop de responsabilités
❌ Risque de masquer trop de détails nécessaires
❌ Peut limiter l'accès aux fonctionnalités avancées
❌ Dépendance unique (SPOF - Single Point of Failure)

