# Design Patterns - Exemples JavaScript pour le Web

Ce dossier contient des exemples pratiques de design patterns en JavaScript, avec des cas d'usage concrets pour le développement Web.

## 🎯 Structure

Chaque pattern contient :
- `avant.js` : Code sans le pattern (problèmes)
- `apres.js` : Code avec le pattern (solution)
- `note.md` : Explications théoriques

## 📚 Liste des Patterns

### Patterns Comportementaux

#### 1. Strategy Pattern
**Cas d'usage Web** : Système de paiement en ligne
- Différentes méthodes de paiement (CB, PayPal, Crypto)
- Stratégies de tarification (Premium, Gold, Étudiant)
- Évite les if/else multiples

```bash
node exemples/01-strategy/apres.js
```

#### 2. Observer Pattern
**Cas d'usage Web** : Panier d'achat e-commerce
- Mise à jour de l'UI en temps réel
- Analytics et tracking
- Notifications et emails
- LocalStorage synchronisé

```bash
node exemples/02-observer/apres.js
```

#### 6. Command Pattern
**Cas d'usage Web** : Éditeur de texte avec Undo/Redo
- Historique des actions
- Annulation/Rétablissement
- Parfait pour les éditeurs WYSIWYG

```bash
node exemples/06-command/apres.js
```

#### 9. Chain of Responsibility
**Cas d'usage Web** : Validation de formulaire
- Validation email, mot de passe, âge
- Chaîne de validateurs modulaire
- Facile d'ajouter de nouvelles règles

```bash
node exemples/09-chain-of-responsibility/apres.js
```

#### 12. State Pattern
**Cas d'usage Web** : États d'un formulaire de commande
- Workflow de formulaire (Draft → Submitted → Validated)
- Actions autorisées selon l'état
- Gestion propre des transitions

```bash
node exemples/12-state/apres.js
```

#### 13. Template Method
**Cas d'usage Web** : Rendu de pages HTML
- Structure commune des pages web
- Pages personnalisables (Home, Blog, Contact, Dashboard)
- SEO et analytics

```bash
node exemples/13-template-method/apres.js
```

### Patterns Créationnels

#### 3. Factory Pattern
**Cas d'usage Web** : Création de composants UI
- Génération de boutons, inputs, modals, toasts
- Composants réutilisables
- Interface unifiée

```bash
node exemples/03-factory/apres.js
```

#### 7. Singleton Pattern
**Cas d'usage Web** : Configuration d'application
- Config globale unique (API URL, thème, langue)
- `meilleure-alternative.js` : Utilisation d'un objet simple (recommandé en JS)

```bash
node exemples/07-singleton/apres.js
node exemples/07-singleton/meilleure-alternative.js
```

#### 10. Builder Pattern
**Cas d'usage Web** : Query Builder SQL
- Construction de requêtes SQL complexes
- API fluide et lisible
- Gestion des JOIN, WHERE, ORDER BY, etc.

```bash
node exemples/10-builder/apres.js
```

### Patterns Structurels

#### 4. Decorator Pattern
**Cas d'usage Web** : Middleware API
- Cache, Logging, Authentification
- Rate limiting, Retry
- Décorateurs empilables

```bash
node exemples/04-decorator/apres.js
```

#### 5. Facade Pattern
**Cas d'usage Web** : Upload de vidéo
- Simplifie un processus complexe
- Compression, génération de miniature, upload S3
- Sauvegarde DB, notifications, cache

```bash
node exemples/05-facade/apres.js
```

#### 8. Adapter Pattern
**Cas d'usage Web** : Adaptation de différentes API de paiement
- Interface unifiée pour Stripe, PayPal, Mollie
- Facilite le changement de provider
- Tests simplifiés

```bash
node exemples/08-adapter/apres.js
```

#### 11. Proxy Pattern
**Cas d'usage Web** : Cache et Logging d'API
- Cache des requêtes API
- Logging des performances
- Proxies combinables

```bash
node exemples/11-proxy/apres.js
```
