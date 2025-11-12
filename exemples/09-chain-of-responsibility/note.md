# Chain of Responsibility Pattern

## Qu'est-ce que c'est ?

Le pattern Chain of Responsibility permet de passer une requête le long d'une chaîne de handlers. Chaque handler décide soit de traiter la requête, soit de la passer au handler suivant dans la chaîne.

## Exemple simple

```php
abstract class Handler {
    protected ?Handler $next = null;
    
    public function setNext(Handler $handler): Handler {
        $this->next = $handler;
        return $handler;
    }
    
    public function handle($request): bool {
        if ($this->next) {
            return $this->next->handle($request);
        }
        return true;
    }
}

$auth = new AuthHandler();
$validation = new ValidationHandler();
$auth->setNext($validation);
$auth->handle($request); // Passe par toute la chaîne
```

## Problème résolu

Pour valider une commande, appliquer des vérifications (authentification, validation métier, vérification du stock), on veut éviter un code avec de multiples if/else imbriqués. La chaîne permet de découpler ces validations.

## Cas d'utilisation

- **Middlewares** en Express.js (authentification, logging, validation)
- Pipeline de validation de formulaires
- Système de support (Level 1, Level 2, Manager)
- Event bubbling dans le DOM
- Filtres et intercepteurs dans les frameworks web
- Traitement de logs avec différents niveaux (debug, info, error)

## Avantages

✅ Découple l'émetteur de la requête des récepteurs
✅ Facilite l'ajout/suppression de handlers
✅ Respecte le principe de responsabilité unique
✅ Ordre de traitement flexible
✅ Chaque handler peut décider de continuer ou d'arrêter la chaîne
✅ Très utilisé dans les architectures web modernes

## Inconvénients

❌ Pas de garantie qu'une requête sera traitée
❌ Peut être difficile à déboguer
❌ Performance impactée si la chaîne est longue
❌ L'ordre des handlers est important

