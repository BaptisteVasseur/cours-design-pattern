<?php

namespace App\Tests\Functional;

use App\Domain\Entity\Commande;
use App\Domain\Entity\LigneCommande;
use App\Domain\Entity\Produit;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Tools\SchemaTool;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/**
 * Classe de base pour tous les tests fonctionnels.
 *
 * Responsabilités :
 *  - Créer/réinitialiser le schéma SQLite avant chaque test
 *  - Fournir des helpers pour insérer des données de test
 *
 * Ces tests sont 100% HTTP : ils ne connaissent pas la structure interne.
 * Ils doivent passer identiquement avant et après le refactoring DDD.
 */
abstract class FunctionalTestCase extends WebTestCase
{
    protected KernelBrowser $client;
    protected EntityManagerInterface $em;

    protected function setUp(): void
    {
        $this->client = static::createClient();
        $this->em     = static::getContainer()->get(EntityManagerInterface::class);

        $meta       = $this->em->getMetadataFactory()->getAllMetadata();
        $schemaTool = new SchemaTool($this->em);
        $schemaTool->dropSchema($meta);
        $schemaTool->createSchema($meta);
    }

    protected function tearDown(): void
    {
        parent::tearDown();
        $this->em->close();
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    protected function créerProduit(string $nom, float $prix, int $stock): Produit
    {
        $produit = new Produit();
        $produit->setNom($nom);
        $produit->setPrix($prix);
        $produit->setStock($stock);

        $this->em->persist($produit);
        $this->em->flush();

        return $produit;
    }

    protected function créerCommande(string $email, string $statut, array $lignes): Commande
    {
        $commande = new Commande();
        $commande->setClientEmail($email);
        $commande->setStatut($statut);

        $total = 0;
        foreach ($lignes as [$produit, $quantite]) {
            $ligne = new LigneCommande();
            $ligne->setCommande($commande);
            $ligne->setProduit($produit);
            $ligne->setQuantite($quantite);
            $ligne->setPrixUnitaire($produit->getPrix());
            $this->em->persist($ligne);
            $commande->addLigne($ligne);
            $total += $produit->getPrix() * $quantite;
        }

        $commande->setTotal($total);
        $this->em->persist($commande);
        $this->em->flush();

        return $commande;
    }

    protected function recharger(object $entity): void
    {
        $this->em->clear();
    }

    protected function trouverCommande(int $id): ?Commande
    {
        $this->em->clear();
        return $this->em->getRepository(Commande::class)->find($id);
    }

    protected function trouverProduit(int $id): ?Produit
    {
        $this->em->clear();
        return $this->em->getRepository(Produit::class)->find($id);
    }
}
