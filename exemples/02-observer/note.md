# Observer Pattern

## Qu'est-ce que c'est ?

Le pattern Observer définit une relation un-à-plusieurs entre objets, de sorte que lorsqu'un objet change d'état, tous ses dépendants sont notifiés et mis à jour automatiquement.

## Exemple simple

```php
class Order {
    private array $observers = [];
    
    public function attach(Observer $observer): void {
        $this->observers[] = $observer;
    }
    
    public function updateStatus(string $status): void {
        foreach ($this->observers as $observer) {
            $observer->update($status);
        }
    }
}

class EmailNotifier implements Observer {
    public function update(string $status): void {
        echo "Email: Votre commande est {$status}\n";
    }
}

$order = new Order();
$order->attach(new EmailNotifier());
$order->updateStatus('livrée'); // Email envoyé
```

## Problème résolu

Dans le code initial, les notifications sont envoyées directement dans les méthodes métier, créant un couplage fort. Impossible d'ajouter/retirer des canaux de notification sans modifier le code existant.

## Cas d'utilisation

- Systèmes de notifications (email, SMS, push)
- Événements dans les interfaces utilisateurs (React, Vue, Angular)
- Synchronisation de données entre composants
- Suivi des changements de statut de commande
- WebSockets et real-time updates
- Event emitters en Node.js

## Avantages

✅ Couplage faible entre sujets et observateurs
✅ Ajout/suppression dynamique d'observateurs
✅ Respect du principe Open/Closed
✅ Communication broadcast vers plusieurs objets
✅ Base de la programmation réactive (RxJS, Redux)

## Inconvénients

❌ Les observateurs sont notifiés dans un ordre aléatoire
❌ Risque de fuites mémoire si les observateurs ne se désinscrivent pas
❌ Peut rendre le flux d'exécution difficile à suivre
❌ Performance impactée si beaucoup d'observateurs

