class CheckoutService {
  calculateTotal(basePrice, membershipType) {
    let total = basePrice;

    if (membershipType === 'premium') {
      total = basePrice * 0.9;
    } else if (membershipType === 'gold') {
      total = basePrice * 0.85;
    } else if (membershipType === 'student') {
      total = basePrice * 0.8;
    }

    return total;
  }

  processPayment(amount, method, details) {
    if (method === 'creditCard') {
      console.log(`Traitement carte bancaire: ${details.cardNumber}`);
      console.log(`Montant: ${amount}€`);
    } else if (method === 'paypal') {
      console.log(`Traitement PayPal: ${details.email}`);
      console.log(`Montant: ${amount}€`);
    } else if (method === 'crypto') {
      console.log(`Traitement Crypto: ${details.wallet}`);
      console.log(`Montant: ${amount}€`);
    }
  }
}

const checkout = new CheckoutService();
checkout.processPayment(100, 'creditCard', { cardNumber: '****1234' });

