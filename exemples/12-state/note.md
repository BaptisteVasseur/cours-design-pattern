# State Pattern

## Qu'est-ce que c'est ?

Le pattern State permet à un objet de modifier son comportement lorsque son état interne change. L'objet semblera changer de classe. C'est une implémentation propre d'une machine à états finis.

## Exemple simple

```php
class Order {
    private OrderState $state;
    
    public function confirm(): void {
        $this->state->confirm($this);
    }
    
    public function setState(OrderState $state): void {
        $this->state = $state;
    }
}

class PendingState implements OrderState {
    public function confirm(Order $order): void {
        $order->setState(new ConfirmedState());
        echo "Commande confirmée\n";
    }
}

$order = new Order();
$order->confirm(); // Change d'état
```

## Problème résolu

Gérer les différents états d'une commande (pending, confirmed, preparing, delivering, delivered, cancelled) avec des transitions valides devient rapidement complexe avec des if/else. Le State encapsule chaque état dans une classe.

## Cas d'utilisation

- Gestion des états de commande (e-commerce, livraison)
- États de connexion (disconnected, connecting, connected, error)
- Workflow d'approbation (draft, review, approved, rejected)
- États d'un document (editing, reviewing, published)
- Machine à états d'un jeu (menu, playing, paused, game-over)
- États TCP (closed, listen, established)

## Avantages

✅ Élimine les conditions complexes
✅ Chaque état est encapsulé dans sa propre classe
✅ Principe de responsabilité unique
✅ Principe Open/Closed (ajout de nouveaux états facile)
✅ Transitions d'états explicites et contrôlées
✅ Code plus maintenable et lisible

## Inconvénients

❌ Peut être excessif pour des états simples
❌ Augmente le nombre de classes
❌ Peut compliquer les états avec beaucoup de transitions

