<?php

namespace App\Tests\Functional;

use App\Domain\Entity\Commande;

class AnnulerCommandeTest extends FunctionalTestCase
{
    public function testAnnulerCommandeEnAttente(): void
    {
        $produit  = $this->créerProduit('Clavier', 89.99, 8);
        $commande = $this->créerCommande('alice@test.fr', Commande::STATUT_EN_ATTENTE, [
            [$produit, 2],
        ]);
        $id = $commande->getId();

        $this->client->request('POST', "/commandes/$id/annuler");

        $this->assertResponseRedirects();
        $this->client->followRedirect();
        $this->assertSelectorTextContains('.alert-success', 'annulée');

        $commandeRechargée = $this->trouverCommande($id);
        $this->assertSame(Commande::STATUT_ANNULEE, $commandeRechargée->getStatut());

        $produitRechargé = $this->trouverProduit($produit->getId());
        $this->assertSame(10, $produitRechargé->getStock());
    }

    public function testAnnulerCommandeExpedieeEchoue(): void
    {
        $produit  = $this->créerProduit('Clavier', 89.99, 8);
        $commande = $this->créerCommande('alice@test.fr', Commande::STATUT_EXPEDIEE, [
            [$produit, 2],
        ]);
        $id = $commande->getId();

        $this->client->request('POST', "/commandes/$id/annuler");

        $this->assertResponseRedirects();
        $this->client->followRedirect();
        $this->assertSelectorTextContains('.alert-error', 'Impossible');

        $commandeRechargée = $this->trouverCommande($id);
        $this->assertSame(Commande::STATUT_EXPEDIEE, $commandeRechargée->getStatut());

        $produitRechargé = $this->trouverProduit($produit->getId());
        $this->assertSame(8, $produitRechargé->getStock());
    }

    public function testAnnulerCommandeDéjàAnnuléeEchoue(): void
    {
        $produit  = $this->créerProduit('Clavier', 89.99, 8);
        $commande = $this->créerCommande('alice@test.fr', Commande::STATUT_ANNULEE, [
            [$produit, 2],
        ]);
        $id = $commande->getId();

        $this->client->request('POST', "/commandes/$id/annuler");

        $this->assertResponseRedirects();
        $this->client->followRedirect();
        $this->assertSelectorTextContains('.alert-error', 'Impossible');
    }

    public function testAnnulerCommandeInexistanteRedirecte(): void
    {
        $this->client->request('POST', '/commandes/9999/annuler');

        $this->assertResponseRedirects();
        $this->client->followRedirect();
        $this->assertSelectorTextContains('.alert-error', 'introuvable');
    }

    public function testAnnulationRestaureLesStocksDeToutesLesLignes(): void
    {
        $clavier = $this->créerProduit('Clavier', 89.99, 8);
        $souris   = $this->créerProduit('Souris',  49.50, 5);

        $commande = $this->créerCommande('bob@test.fr', Commande::STATUT_EN_ATTENTE, [
            [$clavier, 3],
            [$souris, 2],
        ]);
        $id = $commande->getId();

        $this->client->request('POST', "/commandes/$id/annuler");
        $this->assertResponseRedirects();

        $this->assertSame(11, $this->trouverProduit($clavier->getId())->getStock());
        $this->assertSame(7,  $this->trouverProduit($souris->getId())->getStock());
    }
}
