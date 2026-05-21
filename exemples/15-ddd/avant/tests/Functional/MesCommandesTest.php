<?php

namespace App\Tests\Functional;

use App\Domain\Entity\Commande;

class MesCommandesTest extends FunctionalTestCase
{
    public function testPageChargéeSansEmail(): void
    {
        $this->client->request('GET', '/commandes');

        $this->assertResponseIsSuccessful();
        $this->assertSelectorExists('form');
    }

    public function testAucuneCommandePourEmailInconnu(): void
    {
        $this->client->request('GET', '/commandes?email=inconnu@test.fr');

        $this->assertResponseIsSuccessful();
        $this->assertSelectorTextContains('body', 'Aucune commande');
    }

    public function testEmailInvalideAfficheErreur(): void
    {
        $this->client->request('GET', '/commandes?email=pas-un-email');

        $this->assertResponseIsSuccessful();
        $this->assertSelectorTextContains('.alert-error', 'invalide');
    }

    public function testAfficheCommandesDuClient(): void
    {
        $produit = $this->créerProduit('Clavier', 89.99, 10);

        $this->créerCommande('alice@test.fr', Commande::STATUT_EN_ATTENTE, [[$produit, 1]]);
        $this->créerCommande('alice@test.fr', Commande::STATUT_EXPEDIEE,   [[$produit, 2]]);
        $this->créerCommande('bob@test.fr',   Commande::STATUT_EN_ATTENTE, [[$produit, 1]]);

        $this->client->request('GET', '/commandes?email=alice@test.fr');

        $this->assertResponseIsSuccessful();
        $this->assertSelectorCount(2, 'table');
    }

    public function testNAffichePasLesCommandesDesAutresClients(): void
    {
        $produit = $this->créerProduit('Clavier', 89.99, 10);

        $this->créerCommande('alice@test.fr', Commande::STATUT_EN_ATTENTE, [[$produit, 1]]);
        $this->créerCommande('bob@test.fr',   Commande::STATUT_EN_ATTENTE, [[$produit, 1]]);

        $this->client->request('GET', '/commandes?email=alice@test.fr');

        $this->assertSelectorCount(1, 'table');
    }

    public function testAfficheLeStatutDesCommandes(): void
    {
        $produit = $this->créerProduit('Clavier', 89.99, 10);

        $this->créerCommande('alice@test.fr', Commande::STATUT_EN_ATTENTE, [[$produit, 1]]);
        $this->créerCommande('alice@test.fr', Commande::STATUT_ANNULEE,    [[$produit, 1]]);

        $this->client->request('GET', '/commandes?email=alice@test.fr');

        $this->assertSelectorTextContains('body', 'EN_ATTENTE');
        $this->assertSelectorTextContains('body', 'ANNULEE');
    }

    public function testBoutonAnnulerVisibleSeulementPourEnAttente(): void
    {
        $produit = $this->créerProduit('Clavier', 89.99, 10);

        $c1 = $this->créerCommande('alice@test.fr', Commande::STATUT_EN_ATTENTE, [[$produit, 1]]);
        $c2 = $this->créerCommande('alice@test.fr', Commande::STATUT_EXPEDIEE,   [[$produit, 1]]);

        $this->client->request('GET', '/commandes?email=alice@test.fr');

        $this->assertSelectorExists("form[action='/commandes/{$c1->getId()}/annuler']");
        $this->assertSelectorNotExists("form[action='/commandes/{$c2->getId()}/annuler']");
    }
}
