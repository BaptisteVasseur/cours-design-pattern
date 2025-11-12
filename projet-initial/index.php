<?php

class UberEatsApp
{
    private array $restaurants = [];
    private array $orders = [];
    private array $users = [];

    public function createRestaurant(string $name, string $type): array
    {
        $restaurant = [
            'id' => uniqid(),
            'name' => $name,
            'type' => $type,
            'menu' => [],
            'isOpen' => true,
        ];
        $this->restaurants[] = $restaurant;
        return $restaurant;
    }

    public function addMenuItem(string $restaurantId, array $item): void
    {
        foreach ($this->restaurants as &$restaurant) {
            if ($restaurant['id'] === $restaurantId) {
                $restaurant['menu'][] = $item;
                break;
            }
        }
    }

    public function createOrder(string $userId, string $restaurantId, array $items): array
    {
        $user = $this->findUser($userId);
        $restaurant = $this->findRestaurant($restaurantId);
        
        if (!$user || !$restaurant) {
            throw new Exception("User ou Restaurant non trouvé");
        }

        $total = 0;
        foreach ($items as $item) {
            $total += $item['price'];
        }

        $order = [
            'id' => uniqid(),
            'userId' => $userId,
            'restaurantId' => $restaurantId,
            'items' => $items,
            'status' => 'pending',
            'total' => $total,
            'createdAt' => new DateTime(),
        ];

        if ($user['membershipType'] === 'premium') {
            $order['total'] = $total * 0.9;
        } elseif ($user['membershipType'] === 'gold') {
            $order['total'] = $total * 0.85;
        }

        $deliveryFee = $this->calculateDeliveryFee($user, $restaurant);
        $order['total'] += $deliveryFee;

        $this->orders[] = $order;

        $this->sendNotification($userId, "Commande {$order['id']} créée");
        $this->sendNotification($restaurantId, "Nouvelle commande {$order['id']}");

        return $order;
    }

    private function calculateDeliveryFee(array $user, array $restaurant): float
    {
        $distance = rand(0, 100) / 10;
        if ($distance < 2) {
            return 2.5;
        } elseif ($distance < 5) {
            return 4.5;
        } else {
            return 6.5;
        }
    }

    public function processPayment(string $orderId, string $paymentMethod, array $details): void
    {
        $order = $this->findOrder($orderId);
        if (!$order) {
            throw new Exception("Commande non trouvée");
        }

        if ($paymentMethod === 'creditCard') {
            echo "Processing credit card: {$details['cardNumber']}\n";
            echo "Amount: {$order['total']}\n";
        } elseif ($paymentMethod === 'paypal') {
            echo "Processing PayPal: {$details['email']}\n";
            echo "Amount: {$order['total']}\n";
        } elseif ($paymentMethod === 'applePay') {
            echo "Processing Apple Pay: {$details['token']}\n";
            echo "Amount: {$order['total']}\n";
        }

        foreach ($this->orders as &$o) {
            if ($o['id'] === $orderId) {
                $o['status'] = 'paid';
                break;
            }
        }

        $this->sendNotification($order['userId'], "Paiement accepté");
    }

    public function updateOrderStatus(string $orderId, string $newStatus): void
    {
        $order = $this->findOrder($orderId);
        if (!$order) {
            throw new Exception("Commande non trouvée");
        }

        foreach ($this->orders as &$o) {
            if ($o['id'] === $orderId) {
                $o['status'] = $newStatus;
                break;
            }
        }

        $this->sendNotification($order['userId'], "Statut: {$newStatus}");

        if ($newStatus === 'delivered') {
            $this->sendNotification($order['userId'], "Merci d'évaluer votre commande!");
        }
    }

    private function sendNotification(string $recipientId, string $message): void
    {
        echo "Email à {$recipientId}: {$message}\n";
        echo "SMS à {$recipientId}: {$message}\n";
        echo "Push à {$recipientId}: {$message}\n";
    }

    public function searchRestaurants(string $query, array $filters): array
    {
        $results = $this->restaurants;

        if ($query) {
            $results = array_filter($results, function($r) use ($query) {
                return stripos($r['name'], $query) !== false;
            });
        }

        if (isset($filters['type'])) {
            $results = array_filter($results, function($r) use ($filters) {
                return $r['type'] === $filters['type'];
            });
        }

        if (isset($filters['isOpen'])) {
            $results = array_filter($results, function($r) use ($filters) {
                return $r['isOpen'] === $filters['isOpen'];
            });
        }

        return array_values($results);
    }

    public function createUser(string $name, string $email, string $membershipType): array
    {
        $user = [
            'id' => uniqid(),
            'name' => $name,
            'email' => $email,
            'membershipType' => $membershipType,
            'addresses' => [],
            'paymentMethods' => [],
        ];
        $this->users[] = $user;
        return $user;
    }

    private function findUser(string $userId): ?array
    {
        foreach ($this->users as $user) {
            if ($user['id'] === $userId) {
                return $user;
            }
        }
        return null;
    }

    private function findRestaurant(string $restaurantId): ?array
    {
        foreach ($this->restaurants as $restaurant) {
            if ($restaurant['id'] === $restaurantId) {
                return $restaurant;
            }
        }
        return null;
    }

    private function findOrder(string $orderId): ?array
    {
        foreach ($this->orders as $order) {
            if ($order['id'] === $orderId) {
                return $order;
            }
        }
        return null;
    }
}

$app = new UberEatsApp();
$user = $app->createUser("Jean", "jean@email.com", "premium");
$restaurant = $app->createRestaurant("Pizza Luigi", "italian");

$app->addMenuItem($restaurant['id'], ['name' => 'Margherita', 'price' => 12]);
$app->addMenuItem($restaurant['id'], ['name' => '4 Fromages', 'price' => 15]);

$order = $app->createOrder($user['id'], $restaurant['id'], [
    ['name' => 'Margherita', 'price' => 12],
    ['name' => '4 Fromages', 'price' => 15],
]);

$app->processPayment($order['id'], 'creditCard', ['cardNumber' => '1234-5678']);
$app->updateOrderStatus($order['id'], 'preparing');
$app->updateOrderStatus($order['id'], 'delivering');
$app->updateOrderStatus($order['id'], 'delivered');

