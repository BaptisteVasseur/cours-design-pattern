# Proxy Pattern

## Qu'est-ce que c'est ?

Le pattern Proxy fournit un substitut ou un représentant d'un autre objet pour contrôler l'accès à celui-ci. Le proxy intercepte les appels et peut ajouter des fonctionnalités supplémentaires (cache, validation, logging, etc.).

## Exemple simple

```php
class CachedRestaurantProxy implements RestaurantService {
    private array $cache = [];
    
    public function getRestaurant(string $id): array {
        if (isset($this->cache[$id])) {
            return $this->cache[$id]; // Retour du cache
        }
        
        $restaurant = $this->service->getRestaurant($id);
        $this->cache[$id] = $restaurant;
        return $restaurant;
    }
}

$service = new CachedRestaurantProxy($realService);
$service->getRestaurant('123'); // Appel API
$service->getRestaurant('123'); // Cache !
```

## Problème résolu

Accéder directement à un service coûteux (API externe, base de données) à chaque fois n'est pas optimal. Le Proxy peut ajouter du cache, du lazy loading, de la validation ou du contrôle d'accès sans modifier le service original.

## Cas d'utilisation

- Cache de données (éviter des appels API répétés)
- Lazy loading (chargement à la demande)
- Contrôle d'accès et authentification
- Logging et audit
- Virtual proxy pour objets coûteux
- Protection proxy pour validation
- ES6 Proxy pour réactivité (Vue.js, MobX)

## Avantages

✅ Ajoute des fonctionnalités sans modifier l'objet original
✅ Contrôle l'accès à l'objet
✅ Lazy initialization possible
✅ Performance (cache, pooling)
✅ Respecte le principe Open/Closed
✅ Transparence pour le client

## Inconvénients

❌ Ajoute une couche d'indirection
❌ Peut ralentir les opérations simples
❌ Complexité accrue

