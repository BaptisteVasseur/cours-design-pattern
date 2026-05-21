<?php

namespace App\Controller;

use App\Domain\Entity\Commande;
use App\Domain\Entity\LigneCommande;
use App\Domain\Entity\Produit;
use App\Domain\Message\CommandePasseeMessage;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\MessageBusInterface;
use Symfony\Component\Routing\Attribute\Route;

class CommandeController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private MessageBusInterface    $bus,
    ) {}

    // ----------------------------------------------------------------
    // Page d'accueil
    // ----------------------------------------------------------------
    #[Route('/', name: 'home')]
    public function home(): Response
    {
        return $this->render('home.html.twig');
    }

    // ----------------------------------------------------------------
    // USE CASE 1 : Passer une commande
    // ----------------------------------------------------------------
    #[Route('/commandes/passer', name: 'commande_passer', methods: ['GET', 'POST'])]
    public function passerCommande(Request $request): Response
    {
        $produits = $this->em->getRepository(Produit::class)->findAll();

        if ($request->isMethod('POST')) {
            $email    = $request->request->get('email');
            $items    = $request->request->all('items'); // ['produit_id' => quantite]

            // Validation basique
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $this->addFlash('error', 'Email invalide.');
                return $this->render('commande/passer.html.twig', ['produits' => $produits]);
            }

            $hasItems = array_filter($items, fn($qty) => (int) $qty > 0);
            if (empty($hasItems)) {
                $this->addFlash('error', 'Vous devez sélectionner au moins un produit.');
                return $this->render('commande/passer.html.twig', ['produits' => $produits]);
            }

            // Vérification du stock pour tous les produits
            foreach ($items as $produitId => $quantite) {
                $quantite = (int) $quantite;
                if ($quantite <= 0) continue;

                $produit = $this->em->getRepository(Produit::class)->find($produitId);
                if (!$produit) {
                    $this->addFlash('error', "Produit #$produitId introuvable.");
                    return $this->render('commande/passer.html.twig', ['produits' => $produits]);
                }

                if ($produit->getStock() < $quantite) {
                    $this->addFlash('error', "Stock insuffisant pour « {$produit->getNom()} » (stock : {$produit->getStock()}).");
                    return $this->render('commande/passer.html.twig', ['produits' => $produits]);
                }
            }

            // Création de la commande
            $commande = new Commande();
            $commande->setClientEmail($email);
            $total = 0;

            foreach ($items as $produitId => $quantite) {
                $quantite = (int) $quantite;
                if ($quantite <= 0) continue;

                $produit = $this->em->getRepository(Produit::class)->find($produitId);

                // Déduction du stock
                $produit->setStock($produit->getStock() - $quantite);

                // Création de la ligne
                $ligne = new LigneCommande();
                $ligne->setCommande($commande);
                $ligne->setProduit($produit);
                $ligne->setQuantite($quantite);
                $ligne->setPrixUnitaire($produit->getPrix());

                $commande->addLigne($ligne);
                $this->em->persist($ligne);

                $total += $produit->getPrix() * $quantite;
            }

            $commande->setTotal($total);
            $this->em->persist($commande);
            $this->em->flush();

            // Dispatch asynchrone : l'email de confirmation sera envoyé par le worker
            $this->bus->dispatch(new CommandePasseeMessage(
                $commande->getId(),
                $email,
                $total,
            ));

            $this->addFlash('success', "Commande #{$commande->getId()} passée ! Un email de confirmation va vous être envoyé.");
            return $this->redirectToRoute('commande_liste', ['email' => $email]);
        }

        return $this->render('commande/passer.html.twig', ['produits' => $produits]);
    }

    // ----------------------------------------------------------------
    // USE CASE 2 : Annuler une commande
    // ----------------------------------------------------------------
    #[Route('/commandes/{id}/annuler', name: 'commande_annuler', methods: ['POST'])]
    public function annulerCommande(int $id): Response
    {
        $commande = $this->em->getRepository(Commande::class)->find($id);

        if (!$commande) {
            $this->addFlash('error', "Commande #$id introuvable.");
            return $this->redirectToRoute('commande_passer');
        }

        // Règle métier : on ne peut annuler qu'une commande EN_ATTENTE
        if ($commande->getStatut() !== Commande::STATUT_EN_ATTENTE) {
            $this->addFlash('error', "Impossible d'annuler une commande dont le statut est « {$commande->getStatut()} ».");
            return $this->redirectToRoute('commande_liste', ['email' => $commande->getClientEmail()]);
        }

        // Réapprovisionnement du stock
        foreach ($commande->getLignes() as $ligne) {
            $produit = $ligne->getProduit();
            $produit->setStock($produit->getStock() + $ligne->getQuantite());
        }

        $commande->setStatut(Commande::STATUT_ANNULEE);
        $this->em->flush();

        $this->addFlash('success', "Commande #{$commande->getId()} annulée, stocks restaurés.");
        return $this->redirectToRoute('commande_liste', ['email' => $commande->getClientEmail()]);
    }

    // ----------------------------------------------------------------
    // USE CASE 3 : Voir les commandes d'un client
    // ----------------------------------------------------------------
    #[Route('/commandes', name: 'commande_liste', methods: ['GET'])]
    public function mesCommandes(Request $request): Response
    {
        $email    = $request->query->get('email', '');
        $commandes = [];

        if ($email) {
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $this->addFlash('error', 'Email invalide.');
            } else {
                $commandes = $this->em->getRepository(Commande::class)->findBy(
                    ['clientEmail' => $email],
                    ['createdAt' => 'DESC']
                );
            }
        }

        return $this->render('commande/liste.html.twig', [
            'email'     => $email,
            'commandes' => $commandes,
        ]);
    }
}
