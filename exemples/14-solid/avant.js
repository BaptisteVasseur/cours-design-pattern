class User {
  constructor(name, email, phone) {
    this.name = name;
    this.email = email;
    this.phone = phone;
  }
}

class UserManager {
  constructor() {
    this.users = [];
    this.db = { host: 'localhost', database: 'test' };
  }

  addUser(name, email, phone) {
    if (!name || !email) {
      throw new Error('Nom et email requis');
    }

    if (!email.includes('@')) {
      throw new Error('Email invalide');
    }

    const user = new User(name, email, phone);
    this.users.push(user);

    console.log(`💾 Sauvegarde en DB: INSERT INTO users (${name}, ${email}, ${phone})`);
  }

  notifyUser(user, message, type) {
    if (type === 'email') {
      console.log(`📧 Email envoyé à ${user.email}: ${message}`);
    } else if (type === 'sms') {
      console.log(`📱 SMS envoyé au ${user.phone}: ${message}`);
    } else if (type === 'push') {
      console.log(`🔔 Notification push envoyée à ${user.name}: ${message}`);
    } else if (type === 'slack') {
      console.log(`💬 Message Slack envoyé: ${message}`);
    }

    console.log(`💾 Log notification: ${user.email}, ${message}, ${type}`);
  }

  generateReport() {
    let report = '=== RAPPORT DES UTILISATEURS ===\n';
    this.users.forEach(user => {
      report += `Nom: ${user.name}, Email: ${user.email}\n`;
    });
    return report;
  }

  exportToJson() {
    return JSON.stringify(this.users);
  }

  exportToCsv() {
    let csv = 'nom,email,phone\n';
    this.users.forEach(user => {
      csv += `${user.name},${user.email},${user.phone}\n`;
    });
    return csv;
  }

  calculateDiscount(user, membershipType) {
    if (membershipType === 'premium') {
      return 0.20;
    } else if (membershipType === 'gold') {
      return 0.15;
    } else {
      return 0.05;
    }
  }
}

const manager = new UserManager();
manager.addUser('Alice', 'alice@example.com', '+33612345678');

const user = new User('Alice', 'alice@example.com', '+33612345678');
manager.notifyUser(user, 'Bienvenue!', 'email');

console.log(manager.generateReport());
console.log(`Remise: ${manager.calculateDiscount(user, 'premium') * 100}%`);

