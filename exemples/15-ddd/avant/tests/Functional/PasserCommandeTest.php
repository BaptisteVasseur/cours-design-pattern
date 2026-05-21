<?php

namespace App\Tests\Functional;

use App\Domain\Entity\Commande;

class PasserCommandeTest extends FunctionalTestCase
{
    public function testFormulaireAfficheLesProduitsDisponibles(): void
    {
        $this->créerProduit('Clavier', 89.99, 10);
        $this->créerProduit('Souris', 49.50, 0);

        $this->client->request('GET', '/commandes/passer');

        $this->assertResponseIsSuccessful();
        $this->assertSelectorTextContains('table', 'Clavier');
        $this->assertSelectorTextContains('table', 'Souris');
    }

    public function testPasserCommandeValide(): void
    {
        $produit = $this->créerProduit('Clavier', 89.99, 10);

        $this->client->request('POST', '/commandes/passer', [
            'email' => 'alice@test.fr',
            'items' => [$produit->getId() => 2],
        ]);

        $this->assertResponseRedirects();
        $this->client->followRedirect();
        $this->assertSelectorTextContains('.alert-success', 'passée');

        $commande = $this->em->getRepository(Commande::class)->findOneBy(['clientEmail' => 'alice@test.fr']);
        $this->assertNotNull($commande);
        $this->assertSame(Commande::STATUT_EN_ATTENTE, $commande->getStatut());
        $this->assertEqualsWithDelta(179.98, (float) $commande->getTotal(), 0.01);
        $this->assertCount(1, $commande->getLignes());

        $produitRechargé = $this->trouverProduit($produit->getId());
        $this->assertSame(8, $produitRechargé->getStock());
    }

    public function testPasserCommandePlusieursProduits(): void
    {
        $clavier = $this->créerProduit('Clavier', 100.00, 5);
        $souris   = $this->créerProduit('Souris',  50.00, 10);

        $this->client->request('POST', '/commandes/passer', [
            'email' => 'bob@test.fr',
            'items' => [
                $clavier->getId() => 1,
                $souris->getId()  => 3,
            ],
        ]);

        $this->assertResponseRedirects();

        $commande = $this->em->getRepository(Commande::class)->findOneBy(['clientEmail' => 'bob@test.fr']);
        $this->assertCount(2, $commande->getLignes());
        $this->assertEqualsWithDelta(250.00, (float) $commande->getTotal(), 0.01);

        $this->assertSame(4, $this->trouverProduit($clavier->getId())->getStock());
        $this->assertSame(7, $this->trouverProduit($souris->getId())->getStock());
    }

    public function testEmailInvalideAfficheErreur(): void
    {
        $produit = $this->créerProduit('Clavier', 89.99, 10);

        $this->client->request('POST', '/commandes/passer', [
            'email' => 'pas-un-email',
            'items' => [$produit->getId() => 1],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertSelectorTextContains('.alert-error', 'invalide');

        $commandes = $this->em->getRepository(Commande::class)->findAll();
        $this->assertCount(0, $commandes);
    }

    public function testStockInsuffisantAfficheErreur(): void
    {
        $produit = $this->créerProduit('Clavier', 89.99, 3);

        $this->client->request('POST', '/commandes/passer', [
            'email' => 'alice@test.fr',
            'items' => [$produit->getId() => 5],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertSelectorTextContains('.alert-error', 'Stock insuffisant');

        $produitRechargé = $this->trouverProduit($produit->getId());
        $this->assertSame(3, $produitRechargé->getStock());
    }

    public function testAucunProduitSélectionnéAfficheErreur(): void
    {
        $produit = $this->créerProduit('Clavier', 89.99, 10);

        $this->client->request('POST', '/commandes/passer', [
            'email' => 'alice@test.fr',
            'items' => [$produit->getId() => 0],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertSelectorTextContains('.alert-error', 'au moins un produit');

        $this->assertCount(0, $this->em->getRepository(Commande::class)->findAll());
    }

    public function testStockNEstPasDecrementeEnCasErreur(): void
    {
        $produitOk  = $this->créerProduit('Clavier', 89.99, 5);
        $produitKo  = $this->créerProduit('Écran',  349.00, 1);

        $this->client->request('POST', '/commandes/passer', [
            'email' => 'alice@test.fr',
            'items' => [
                $produitOk->getId() => 2,
                $produitKo->getId() => 3,
            ],
        ]);

        $this->assertSelectorTextContains('.alert-error', 'Stock insuffisant');

        $this->assertSame(5, $this->trouverProduit($produitOk->getId())->getStock());
        $this->assertSame(1, $this->trouverProduit($produitKo->getId())->getStock());
    }
}
