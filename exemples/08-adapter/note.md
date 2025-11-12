# Adapter Pattern

## Qu'est-ce que c'est ?

Le pattern Adapter permet à des interfaces incompatibles de travailler ensemble. Il agit comme un pont entre deux interfaces différentes, convertissant l'interface d'une classe en une autre interface attendue par les clients.

## Exemple simple

```php
class StripeAdapter implements PaymentProvider {
    private StripeAPI $stripe;
    
    public function pay(float $euros): void {
        $cents = $euros * 100;
        $this->stripe->charge($cents);
    }
}

class PayPalAdapter implements PaymentProvider {
    private PayPalAPI $paypal;
    
    public function pay(float $euros): void {
        $dollars = $euros * 1.1;
        $this->paypal->sendPayment($dollars);
    }
}

$payment = new StripeAdapter();
$payment->pay(50); // Interface unifiée
```

## Problème résolu

Intégration de librairies tierces (Stripe, PayPal, Google Maps) avec des interfaces différentes. L'Adapter crée une interface unifiée pour notre application tout en utilisant des APIs externes différentes.

## Cas d'utilisation

- Intégration de services de paiement multiples (Stripe, PayPal, etc.)
- Connexion à différentes APIs externes
- Support de plusieurs services de stockage (AWS S3, Azure Blob, Google Cloud)
- Intégration de différents services d'envoi d'emails
- Wrapper pour différentes librairies de logging
- Migration progressive d'une ancienne API vers une nouvelle

## Avantages

✅ Respecte le principe Open/Closed
✅ Sépare la logique métier de l'intégration externe
✅ Facilite le changement de librairie/service
✅ Uniformise les interfaces hétérogènes
✅ Facilite les tests (mock des adapters)
✅ Permet la réutilisation de code existant

## Inconvénients

❌ Augmente la complexité avec des couches supplémentaires
❌ Peut introduire une légère overhead de performance
❌ Nécessite de maintenir le code d'adaptation

