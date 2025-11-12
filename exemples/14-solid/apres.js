class User {
  constructor(name, email, phone) {
    this.name = name;
    this.email = email;
    this.phone = phone;
  }
}

class UserValidator {
  validate(name, email) {
    if (!name || !email) {
      throw new Error('Nom et email requis');
    }

    if (!email.includes('@')) {
      throw new Error('Email invalide');
    }
  }
}

class UserRepository {
  constructor() {
    this.users = [];
  }

  save(user) {
    this.users.push(user);
    console.log(`💾 Sauvegarde en mémoire: ${user.name}`);
  }

  findAll() {
    return this.users;
  }
}

class DatabaseUserRepository {
  constructor(db) {
    this.db = db;
  }

  save(user) {
    console.log(`💾 Sauvegarde en DB: INSERT INTO users VALUES (${user.name}, ${user.email}, ${user.phone})`);
  }

  findAll() {
    console.log('📊 SELECT * FROM users');
    return [];
  }
}

class UserService {
  constructor(repository, validator) {
    this.repository = repository;
    this.validator = validator;
  }

  addUser(name, email, phone) {
    this.validator.validate(name, email);
    const user = new User(name, email, phone);
    this.repository.save(user);
    return user;
  }

  getAllUsers() {
    return this.repository.findAll();
  }
}

class Notifier {
  send(user, message) {
    throw new Error('La méthode send doit être implémentée');
  }
}

class EmailNotifier extends Notifier {
  send(user, message) {
    console.log(`📧 Email envoyé à ${user.email}: ${message}`);
  }
}

class SmsNotifier extends Notifier {
  send(user, message) {
    console.log(`📱 SMS envoyé au ${user.phone}: ${message}`);
  }
}

class PushNotifier extends Notifier {
  send(user, message) {
    console.log(`🔔 Notification push envoyée à ${user.name}: ${message}`);
  }
}

class SlackNotifier extends Notifier {
  send(user, message) {
    console.log(`💬 Message Slack envoyé: ${message}`);
  }
}

class NotificationLogger {
  log(user, message, type) {
    console.log(`📝 Log: ${user.email} - ${message} - ${type} - ${new Date().toISOString()}`);
  }
}

class NotificationService {
  constructor(notifier, logger) {
    this.notifier = notifier;
    this.logger = logger;
  }

  notify(user, message, type) {
    this.notifier.send(user, message);
    this.logger.log(user, message, type);
  }
}

class Exporter {
  export(users) {
    throw new Error('La méthode export doit être implémentée');
  }
}

class JsonExporter extends Exporter {
  export(users) {
    return JSON.stringify(users);
  }
}

class CsvExporter extends Exporter {
  export(users) {
    let csv = 'nom,email,phone\n';
    users.forEach(user => {
      csv += `${user.name},${user.email},${user.phone}\n`;
    });
    return csv;
  }
}

class ReportGenerator {
  constructor(exporter) {
    this.exporter = exporter;
  }

  generate(users) {
    return this.exporter.export(users);
  }
}

class DiscountStrategy {
  calculate() {
    throw new Error('La méthode calculate doit être implémentée');
  }
}

class PremiumDiscount extends DiscountStrategy {
  calculate() {
    return 0.20;
  }
}

class GoldDiscount extends DiscountStrategy {
  calculate() {
    return 0.15;
  }
}

class StandardDiscount extends DiscountStrategy {
  calculate() {
    return 0.05;
  }
}

class DiscountCalculator {
  constructor(strategy) {
    this.strategy = strategy;
  }

  getDiscount() {
    return this.strategy.calculate();
  }
}

console.log('=== Exemple d\'application des principes SOLID ===\n');

const repository = new UserRepository();
const validator = new UserValidator();
const userService = new UserService(repository, validator);

const user = userService.addUser('Alice', 'alice@example.com', '+33612345678');
console.log('');

const emailNotifier = new EmailNotifier();
const logger = new NotificationLogger();
const notificationService = new NotificationService(emailNotifier, logger);
notificationService.notify(user, 'Bienvenue!', 'email');
console.log('');

const reportGenerator = new ReportGenerator(new JsonExporter());
console.log('📄 Rapport JSON:');
console.log(reportGenerator.generate([user]));
console.log('');

const csvReportGenerator = new ReportGenerator(new CsvExporter());
console.log('📄 Rapport CSV:');
console.log(csvReportGenerator.generate([user]));
console.log('');

const discountCalculator = new DiscountCalculator(new PremiumDiscount());
console.log(`💰 Remise Premium: ${discountCalculator.getDiscount() * 100}%`);

