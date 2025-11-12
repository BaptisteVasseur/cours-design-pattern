# Exercices SOLID - JavaScript

Ce document contient de nombreux exemples pour comprendre et pratiquer chaque principe SOLID.

---

## 1. Single Responsibility Principle (SRP)

> Une classe ne devrait avoir qu'une seule raison de changer.

### Exemple 1 : Gestion d'utilisateur

**❌ AVANT - Violation du SRP**

```javascript
class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }

  save() {
    const db = new Database();
    db.connect();
    db.query(`INSERT INTO users VALUES ('${this.name}', '${this.email}')`);
  }

  sendEmail(subject, message) {
    console.log(`Envoi email à ${this.email}: ${subject}`);
  }

  generateReport() {
    return `Utilisateur: ${this.name} - Email: ${this.email}`;
  }

  validateEmail() {
    return this.email.includes('@');
  }
}
```

**Problème** : La classe `User` a trop de responsabilités.

**✅ APRÈS - Respect du SRP**

```javascript
class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }
}

class UserRepository {
  save(user) {
    const db = new Database();
    db.connect();
    db.query(`INSERT INTO users VALUES ('${user.name}', '${user.email}')`);
  }
}

class EmailService {
  send(user, subject, message) {
    console.log(`Envoi email à ${user.email}: ${subject}`);
  }
}

class UserReportGenerator {
  generate(user) {
    return `Utilisateur: ${user.name} - Email: ${user.email}`;
  }
}

class UserValidator {
  validateEmail(email) {
    return email.includes('@');
  }
}
```

---

## 2. Open/Closed Principle (OCP)

> Les entités logicielles doivent être ouvertes à l'extension mais fermées à la modification.

### Exemple 1 : Système de paiement

**❌ AVANT - Violation de l'OCP**

```javascript
class PaymentProcessor {
  processPayment(amount, method) {
    if (method === 'creditCard') {
      console.log(`Paiement de ${amount}€ par carte bancaire`);
    } else if (method === 'paypal') {
      console.log(`Paiement de ${amount}€ par PayPal`);
    } else if (method === 'bitcoin') {
      console.log(`Paiement de ${amount}€ par Bitcoin`);
    }
  }
}
```

**✅ APRÈS - Respect de l'OCP**

```javascript
class PaymentMethod {
  process(amount) {
    throw new Error('Method must be implemented');
  }
}

class CreditCardPayment extends PaymentMethod {
  process(amount) {
    console.log(`Paiement de ${amount}€ par carte bancaire`);
  }
}

class PayPalPayment extends PaymentMethod {
  process(amount) {
    console.log(`Paiement de ${amount}€ par PayPal`);
  }
}

class BitcoinPayment extends PaymentMethod {
  process(amount) {
    console.log(`Paiement de ${amount}€ par Bitcoin`);
  }
}

class PaymentProcessor {
  constructor(paymentMethod) {
    this.paymentMethod = paymentMethod;
  }

  processPayment(amount) {
    this.paymentMethod.process(amount);
  }
}
```

---

## 3. Liskov Substitution Principle (LSP)

> Les objets d'une classe dérivée doivent pouvoir remplacer les objets de la classe de base.

### Exemple 1 : Oiseaux qui volent

**❌ AVANT - Violation du LSP**

```javascript
class Bird {
  fly() {
    console.log('Je vole');
  }
}

class Sparrow extends Bird {
  fly() {
    console.log('Le moineau vole');
  }
}

class Penguin extends Bird {
  fly() {
    throw new Error('Les pingouins ne volent pas !');
  }
}
```

**✅ APRÈS - Respect du LSP**

```javascript
class Bird {
  eat() {
    console.log('Je mange');
  }
}

class FlyingBird extends Bird {
  fly() {
    console.log('Je vole');
  }
}

class Sparrow extends FlyingBird {
  fly() {
    console.log('Le moineau vole');
  }
}

class Penguin extends Bird {
  swim() {
    console.log('Le pingouin nage');
  }
}
```

---

## 4. Interface Segregation Principle (ISP)

> Les clients ne doivent pas être forcés de dépendre d'interfaces qu'ils n'utilisent pas.

### Exemple 1 : Machine multifonction

**❌ AVANT - Violation de l'ISP**

```javascript
class MultiFunctionDevice {
  print(document) {
    throw new Error('Must implement');
  }

  scan(document) {
    throw new Error('Must implement');
  }

  fax(document) {
    throw new Error('Must implement');
  }
}

class SimplePrinter extends MultiFunctionDevice {
  print(document) {
    console.log(`Impression: ${document}`);
  }

  scan(document) {
    throw new Error('Non supporté');
  }

  fax(document) {
    throw new Error('Non supporté');
  }
}
```

**✅ APRÈS - Respect de l'ISP**

```javascript
class Printer {
  print(document) {
    throw new Error('Must implement');
  }
}

class Scanner {
  scan(document) {
    throw new Error('Must implement');
  }
}

class FaxMachine {
  fax(document) {
    throw new Error('Must implement');
  }
}

class SimplePrinter extends Printer {
  print(document) {
    console.log(`Impression: ${document}`);
  }
}

class MultiFunctionDevice extends Printer {
  constructor() {
    super();
    this.scanner = new ScannerImpl();
    this.faxMachine = new FaxMachineImpl();
  }

  print(document) {
    console.log(`Impression: ${document}`);
  }

  scan(document) {
    return this.scanner.scan(document);
  }

  fax(document) {
    return this.faxMachine.fax(document);
  }
}
```

---

## 5. Dependency Inversion Principle (DIP)

> Les modules de haut niveau ne doivent pas dépendre des modules de bas niveau.

### Exemple 1 : Service utilisateur

**❌ AVANT - Violation du DIP**

```javascript
class MySQLDatabase {
  connect() {
    console.log('Connexion MySQL');
  }

  query(sql) {
    console.log(`Requête: ${sql}`);
  }
}

class UserService {
  constructor() {
    this.database = new MySQLDatabase();
  }

  getUser(id) {
    this.database.connect();
    this.database.query(`SELECT * FROM users WHERE id = ${id}`);
  }
}
```

**✅ APRÈS - Respect du DIP**

```javascript
class Database {
  connect() {
    throw new Error('Must implement');
  }

  query(sql) {
    throw new Error('Must implement');
  }
}

class MySQLDatabase extends Database {
  connect() {
    console.log('Connexion MySQL');
  }

  query(sql) {
    console.log(`Requête MySQL: ${sql}`);
  }
}

class PostgreSQLDatabase extends Database {
  connect() {
    console.log('Connexion PostgreSQL');
  }

  query(sql) {
    console.log(`Requête PostgreSQL: ${sql}`);
  }
}

class UserService {
  constructor(database) {
    this.database = database;
  }

  getUser(id) {
    this.database.connect();
    this.database.query(`SELECT * FROM users WHERE id = ${id}`);
  }
}

const userService1 = new UserService(new MySQLDatabase());
const userService2 = new UserService(new PostgreSQLDatabase());
```

---

## Résumé

| Principe | En bref | Signal d'alarme |
|----------|---------|-----------------|
| **SRP** | Une classe = une responsabilité | Classe > 200 lignes |
| **OCP** | Ouvert à l'extension, fermé à la modification | Beaucoup de if/else |
| **LSP** | Les classes enfants doivent être substituables | Exceptions dans les enfants |
| **ISP** | Interfaces petites et spécifiques | Méthodes "Not implemented" |
| **DIP** | Dépendre d'abstractions, pas de concret | `new` dans les constructeurs |

