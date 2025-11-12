
// 1. Lister les stragégies pour les tarifications

// Abonnement Premium
// Abonnement Gold
// Abonnement Student

// 2. Lister les stratégies pour les modes de paiement

// Paiement Carte
// Paiement Paypal
// Paiement Crypto

// 3. Créer les classes associées en JS
// 4. Séparer le code actuel pour respecter les principes SOLID
// 5. Utiliser les stratégies avec le nouveau code


class PricingStragegy {
    calculate(price) {
        throw new Error('Stratégie de base');
    }
}

class GoldStrategy extends PricingStragegy {
    calculate(price) {
        return price * 0.85;
    }
}

class PremiumStrategy extends PricingStragegy {
    calculate(price) {
        return price * 0.9;
    }
}

class StudentStrategy extends PricingStragegy {
    calculate(price) {
        return price * 0.8;
    }
}

class OldStrategy extends PricingStragegy {
    calculate(price) {
        return price * 0.5;
    }
}

class PaymentStrategy {
    pay(amount) {
        throw new Error('Stratégie de paiement de base');
    }
}

class CreditCardStrategy extends PaymentStrategy {
    pay(amount, details) {
        console.log(`Traitement carte bancaire: ${details.cardNumber}`);
        console.log(`Montant: ${amount}€`);
    }
}

class PaypalStrategy extends PaymentStrategy {
    pay(amount, details) {
        console.log(`Traitement PayPal: ${details.email}`);
        console.log(`Montant: ${amount}€`);
    }
}

class CryptoStrategy extends PaymentStrategy {
    pay(amount, details) {
        console.log(`Traitement Crypto: ${details.wallet}`);
        console.log(`Montant: ${amount}€`);
    }
}

// Ajouter un autre type de paiement : en nature

class NatureStrategy extends PaymentStrategy {
    pay(amount, details) {
        console.log(`Traitement Nature: ${details.item}`);
        console.log(`Valeur estimée: ${amount}€`);
    }
}

class CheckoutService {

    constructor(pricingStrategy, paiementStrategy) {
        this.setPricingStrategy(pricingStrategy);
        this.setPaymentStrategy(paiementStrategy);

    }

    setPricingStrategy(pricingStrategy) {
        this.pricingStrategy = pricingStrategy;
    }

    setPaymentStrategy(paiementStrategy) {
        this.paiementStrategy = paiementStrategy;
    }

    calculateTotal(price) {
        return this.pricingStrategy.calculatePrice(price)
    }

    processPayment(amount) {
        return this.paiementStrategy.pay(amount);
    }
}

const service = new CheckoutService(
    new PremiumStrategy(),
    new PaypalStrategy(),
);
console.log(service.calculateTotal(100)); // * 0.85 = 85

service.setPricingStrategy(new StudentStrategy());
service.setPaymentStrategy(new CreditCardStrategy());
console.log(service.calculateTotal(100)); // * 0.8 = 80

service.setPricingStrategy(new OldStrategy());
service.setPaymentStrategy(new NatureStrategy());
console.log(service.calculateTotal(100)); // * 0.5 = 50
