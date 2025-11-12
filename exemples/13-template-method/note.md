# Template Method Pattern

## Qu'est-ce que c'est ?

Le pattern Template Method définit le squelette d'un algorithme dans une méthode, en déléguant certaines étapes aux sous-classes. Les sous-classes peuvent redéfinir certaines étapes sans changer la structure globale de l'algorithme.

## Exemple simple

```php
abstract class OrderProcessor {
    public function process(Order $order): void {
        $this->validate($order);
        $this->calculatePrice($order);
        $this->pay($order);
        $this->notifyCustomer($order); // Peut varier
    }
    
    abstract protected function notifyCustomer(Order $order): void;
}

class ExpressProcessor extends OrderProcessor {
    protected function notifyCustomer(Order $order): void {
        echo "SMS + Email urgent envoyés\n";
    }
}

$processor = new ExpressProcessor();
$processor->process($order); // Workflow complet
```

## Problème résolu

Traiter différents types de commandes (standard, express, programmée) suit le même workflow général mais avec des variations à certaines étapes. Le Template Method évite la duplication du workflow tout en permettant la personnalisation.

## Cas d'utilisation

- Workflows avec étapes communes (processus de commande, checkout)
- Algorithmes de parsing avec structure similaire
- Tests unitaires avec setUp/tearDown
- Hooks de cycle de vie (React, Vue)
- Pipelines de traitement de données
- Processus d'authentification avec différentes méthodes

## Avantages

✅ Évite la duplication de code
✅ Contrôle du flux d'exécution centralisé
✅ Facilite l'ajout de nouvelles variations
✅ Respecte le principe Open/Closed
✅ Structure claire et prévisible
✅ Points d'extension bien définis (hooks)

## Inconvénients

❌ Limité par l'héritage (moins flexible que la composition)
❌ Peut violer le principe de substitution de Liskov
❌ Rigidité de la structure
❌ Peut être difficile à maintenir si trop complexe

