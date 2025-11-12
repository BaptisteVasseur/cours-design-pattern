// class PaymentProcessor {
//   processPayment(amount, currency) {
//     throw new Error('La méthode processPayment doit être implémentée');
//   }
// }
//
// class StripeAPI {
//   charge(amountInCents, currency, metadata) {
//     console.log(`💳 Stripe API: Charging ${amountInCents / 100} ${currency}`);
//     return {
//       id: `ch_${Math.random().toString(36).substr(2, 9)}`,
//       status: 'succeeded',
//       amount: amountInCents,
//       currency: currency
//     };
//   }
// }
//
// class PayPalAPI {
//   createPayment(data) {
//     console.log(`🅿️ PayPal API: Creating payment for ${data.value} ${data.currency}`);
//     return {
//       paymentId: `PAY-${Math.random().toString(36).substr(2, 9)}`,
//       state: 'approved',
//       transactions: [{
//         amount: { total: data.value, currency: data.currency }
//       }]
//     };
//   }
// }
//
// class StripeAdapter extends PaymentProcessor {
//   constructor() {
//     super();
//     this.stripe = new StripeAPI();
//   }
//
//   processPayment(amount, currency) {
//     const amountInCents = Math.round(amount * 100);
//     const result = this.stripe.charge(amountInCents, currency, {});
//
//     return {
//       success: result.status === 'succeeded',
//       transactionId: result.id,
//       amount: amount,
//       currency: currency,
//       provider: 'Stripe'
//     };
//   }
// }
//
// class PayPalAdapter extends PaymentProcessor {
//   constructor() {
//     super();
//     this.paypal = new PayPalAPI();
//   }
//
//   processPayment(amount, currency) {
//     const result = this.paypal.createPayment({
//       value: amount.toString(),
//       currency: currency
//     });
//
//     return {
//       success: result.state === 'approved',
//       transactionId: result.paymentId,
//       amount: amount,
//       currency: currency,
//       provider: 'PayPal'
//     };
//   }
// }
//
// class CheckoutService {
//   constructor(paymentProcessor) {
//     this.paymentProcessor = paymentProcessor;
//   }
//
//   checkout(cart, currency = 'EUR') {
//     const total = cart.reduce((sum, item) => sum + item.price, 0);
//
//     return this.paymentProcessor.processPayment(total, currency);
//   }
// }
//
// const cart = [
//   { name: 'Laptop', price: 999 },
//   { name: 'Mouse', price: 49 }
// ];
//
// console.log('=== Test avec différents fournisseurs de paiement ===');
//
// const stripeCheckout = new CheckoutService(new StripeAdapter());
// stripeCheckout.checkout(cart);
//
// const paypalCheckout = new CheckoutService(new PayPalAdapter());
// paypalCheckout.checkout(cart);


class StripePayment {
    makePayment(amount, currency) {
        console.log(`Stripe: ${amount} ${currency}`);
        return { success: true, stripeId: 'ch_123' };
    }
}

class PayPalPayment {
    sendPayment(value, curr) {
        console.log(`PayPal: ${value} ${curr}`);
        return { status: 'completed', transactionId: 'pp_456' };
    }
}


class StripePaymentAdapter {
    constructor() {
        this.stripePayment = new StripePayment();
    }

    pay(amount, currency) {
        return this.stripePayment.makePayment(amount, currency)
    }
}

class PaypalPaymentAdapter {
    constructor() {
        this.paypalPaiment = new PayPalPayment();
    }

    pay(amount, currency) {
        return this.paypalPaiment.sendPayment(amount, currency)
    }
}

class CheckoutService {
    constructor(paymentAdapter) {
        this.paiementAdapter = paymentAdapter
    }

    pay(amout, currency) {
        return this.paiementAdapter.pay(amout, currency)
    }
}

const choice = 'paypal';
if (choice === 'paypal') {
    const adapter = new PaypalPaymentAdapter();
} else {
    const adapter = new StripePaymentAdapter();
}

const service = new CheckoutService(adapter);
service.pay(10, 'EUR');













