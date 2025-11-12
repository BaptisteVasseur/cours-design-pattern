# Builder Pattern

## Qu'est-ce que c'est ?

Le pattern Builder permet de construire des objets complexes étape par étape. Il sépare la construction d'un objet complexe de sa représentation, permettant le même processus de construction de créer différentes représentations.

## Exemple simple

```php
class OrderBuilder {
    private Order $order;
    
    public function addItem(string $name, float $price): self {
        $this->order->items[] = ['name' => $name, 'price' => $price];
        return $this;
    }
    
    public function setAddress(string $address): self {
        $this->order->address = $address;
        return $this;
    }
    
    public function build(): Order {
        return $this->order;
    }
}

$order = (new OrderBuilder())
    ->addItem('Pizza', 12)
    ->addItem('Coca', 3)
    ->setAddress('123 rue...')
    ->build();
```

## Problème résolu

Créer une commande complexe avec de nombreux paramètres optionnels rend le constructeur illisible. Le Builder offre une API fluide et claire pour construire l'objet progressivement.

## Cas d'utilisation

- Construction de requêtes SQL/HTTP complexes
- Configuration d'objets avec beaucoup de paramètres optionnels
- Création de documents (PDF, HTML) avec structure complexe
- Query builders (Knex.js, TypeORM)
- FormData builders dans les applications web
- Construction de menus de restaurant personnalisés

## Avantages

✅ Construction étape par étape claire et lisible
✅ Même code de construction pour différentes représentations
✅ API fluide (method chaining)
✅ Isolement du code de construction
✅ Gestion facile des paramètres optionnels
✅ Validation progressive possible
✅ Immutabilité de l'objet final

## Inconvénients

❌ Augmente la complexité du code
❌ Nécessite de créer des classes supplémentaires
❌ Peut être excessif pour des objets simples

