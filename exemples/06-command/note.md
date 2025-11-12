# Command Pattern

## Qu'est-ce que c'est ?

Le pattern Command encapsule une requête comme un objet, permettant ainsi de paramétrer des clients avec différentes requêtes, de mettre en file d'attente ou de logger des requêtes, et de supporter les opérations annulables.

## Exemple simple

```php
class AddItemCommand implements Command {
    public function execute(): void {
        $this->cart->add($this->item);
    }
    
    public function undo(): void {
        $this->cart->remove($this->item);
    }
}

$history = new CommandHistory();
$history->execute(new AddItemCommand($cart, $item));
$history->undo(); // Annule l'ajout
```

## Problème résolu

Besoin d'annuler des actions (undo), de rejouer des actions, de mettre en file d'attente des opérations, ou de logger l'historique des actions. Le Command transforme les actions en objets manipulables.

## Cas d'utilisation

- Système undo/redo dans un éditeur
- File d'attente de jobs (queue workers)
- Transactions et rollback en base de données
- Macros et scripts d'automatisation
- Boutons et actions dans une interface
- Event sourcing et CQRS
- Background jobs (envoi d'emails, génération de rapports)

## Avantages

✅ Découple l'objet qui invoque l'opération de celui qui sait l'exécuter
✅ Facilite l'ajout de nouvelles commandes (Open/Closed)
✅ Permet de composer des commandes (macro-commandes)
✅ Implémentation facile d'undo/redo
✅ Log et audit trail automatique
✅ File d'attente et exécution différée

## Inconvénients

❌ Augmente le nombre de classes
❌ Peut être excessif pour des opérations simples
❌ Complexité accrue pour des cas d'usage basiques

