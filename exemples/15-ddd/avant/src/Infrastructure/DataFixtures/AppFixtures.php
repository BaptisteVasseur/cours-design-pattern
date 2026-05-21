<?php

namespace App\Infrastructure\DataFixtures;

use App\Domain\Entity\Produit;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class AppFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        $catalogue = [
            ['nom' => 'Clavier mécanique',  'prix' => 89.99,  'stock' => 15],
            ['nom' => 'Souris ergonomique', 'prix' => 49.50,  'stock' => 30],
            ['nom' => 'Écran 27"',          'prix' => 349.00, 'stock' => 8],
            ['nom' => 'Webcam HD',          'prix' => 69.90,  'stock' => 20],
            ['nom' => 'Casque audio',       'prix' => 129.00, 'stock' => 12],
        ];

        foreach ($catalogue as $data) {
            $produit = new Produit();
            $produit->setNom($data['nom']);
            $produit->setPrix($data['prix']);
            $produit->setStock($data['stock']);
            $manager->persist($produit);
        }

        $manager->flush();
    }
}
