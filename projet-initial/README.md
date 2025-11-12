# Projet Initial - Application Uber Eats Sans Design Patterns

## Objectif

Ce dossier contient une application de type **Uber Eats** écrite **sans utiliser de design patterns**. Le code fonctionne, mais présente de nombreux problèmes de maintenabilité et d'extensibilité.

## Problèmes identifiés

### 1. Classe God Object

La classe `UberEatsApp` fait **tout** :
- Gestion des restaurants
- Gestion des commandes
- Gestion des utilisateurs
- Calcul des prix
- Notifications
- Paiements

→ **Violation du principe de responsabilité unique (SRP)**

### 2. Logique métier mélangée

```php
if ($user['membershipType'] === 'premium') {
  $order['total'] = $total * 0.9;
} elseif ($user['membershipType'] === 'gold') {
  $order['total'] = $total * 0.85;
}
```

→ Ajouter un nouveau type d'abonnement nécessite de modifier le code existant
→ **Violation du principe Open/Closed**

### 3. Couplage fort

Les notifications sont codées en dur dans les méthodes :

```php
$this->sendNotification($userId, "message");
// Envoie toujours email + SMS + push
```

→ Impossible d'ajouter/retirer des canaux sans modifier le code

### 4. Méthodes de paiement rigides

```php
if ($paymentMethod === 'creditCard') {
  // ...
} elseif ($paymentMethod === 'paypal') {
  // ...
}
```

→ Ajouter Stripe ou Apple Pay nécessite de modifier la méthode

### 5. Création d'objets non structurée

```php
$restaurant = [
  'id' => uniqid(),
  'name' => $name,
  'type' => $type,
  'menu' => [],
  'isOpen' => true,
];
```

→ Pas de validation, pas de logique métier, objets anémiques

### 6. Tests difficiles

Impossible de :
- Mocker les dépendances
- Tester isolément chaque fonctionnalité
- Injecter des dépendances

### 7. Duplication de code

La logique de calcul des frais de livraison est dupliquée :

```php
$distance = rand(0, 100) / 10;
if ($distance < 2) return 2.5;
elseif ($distance < 5) return 4.5;
```

## Exercice

Avant de regarder les solutions, essayez d'identifier :

1. **Quels patterns** pourraient résoudre chaque problème ?
2. **Comment** refactoriser ce code progressivement ?
3. **Par où commencer** pour avoir le plus d'impact ?

## Indices

| Problème | Pattern à considérer |
|----------|---------------------|
| Calcul des prix selon abonnement | **Strategy** |
| Système de notifications | **Observer** |
| Création de restaurants | **Factory** |
| Ajout d'options aux plats | **Decorator** |
| Processus de commande complexe | **Facade** |
| Méthodes de paiement multiples | **Strategy** ou **Adapter** |
| Annuler une action | **Command** |

## Comment utiliser

```bash
# Exécuter le code initial
php projet-initial/index.php
```

## Analyse guidée

### Questions à se poser

1. **Que se passe-t-il si je veux ajouter un nouveau type d'utilisateur ?**
   → Combien de fichiers dois-je modifier ?

2. **Comment tester la logique de paiement sans créer de commande ?**
   → Est-ce possible actuellement ?

3. **Si je veux ajouter Telegram comme canal de notification ?**
   → Où dois-je modifier le code ?

4. **Comment ajouter des options à un plat (extra fromage, bacon) ?**
   → Dois-je créer des sous-classes pour chaque combinaison ?

## Métriques du code

- **Complexité cyclomatique** : Élevée
- **Couplage** : Fort
- **Cohésion** : Faible
- **Testabilité** : Difficile
- **Maintenabilité** : Problématique

## Réflexion

> "Le code qui fonctionne n'est pas nécessairement du bon code."

Ce projet initial **fonctionne parfaitement** mais :
- ❌ Difficile à maintenir
- ❌ Difficile à tester
- ❌ Difficile à faire évoluer
- ❌ Fragile aux changements

Les design patterns vont transformer ce code en une architecture :
- ✅ Maintenable
- ✅ Testable
- ✅ Extensible
- ✅ Robuste


