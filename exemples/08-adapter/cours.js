
// Gérer les paiements avec Stripe - API 1
// Gérer les paiements avec Paypal - API 2

class StripePayment {
    pay() {
        // call api vers /pay de stripe
    }
    refund() {
        // call api vers /refund de stripe
    }
}

class PaypalPayment {
    pay() {
        // call api vers /init-transaction chez paypal
        // call api vers /confirm-transaction
    }
    refund() {
        // aucun call
    }
}

class ChequePayment {
    pay() {
        // Envoyer un mail à l'utilisateur
        // avec les infos pour le cheque
    }
    refund() {
        // envoyer un sms à l'utilisateur
        // pour lui dire qu'il va recevoir un cheque
        // de remboursement
    }
}

// quand j'ai un commande
// et j'appuie sur le boutton pour payer

const monModeDePaiement = new ChequePayment()
monModeDePaiement.pay(10);
monModeDePaiement.refund(10);
