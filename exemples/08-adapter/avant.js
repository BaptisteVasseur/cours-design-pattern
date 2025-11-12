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

const stripe = new StripePayment();
stripe.makePayment(100, 'EUR');

const paypal = new PayPalPayment();
paypal.sendPayment(100, 'EUR');

// Adapter pour Stripe
// Adapter pour Paypal

const stripe = new StripePaymentAdapter();
stripe.pay(100, 'EUR');

const paypal = new PayPalPaymentAdapter();
stripe.pay(100, 'EUR');
