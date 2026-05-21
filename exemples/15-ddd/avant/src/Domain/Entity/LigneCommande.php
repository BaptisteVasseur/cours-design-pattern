<?php

namespace App\Domain\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'ligne_commande')]
class LigneCommande
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Commande::class, inversedBy: 'lignes')]
    #[ORM\JoinColumn(nullable: false)]
    private Commande $commande;

    #[ORM\ManyToOne(targetEntity: Produit::class)]
    #[ORM\JoinColumn(nullable: false)]
    private Produit $produit;

    #[ORM\Column(type: 'integer')]
    private int $quantite;

    #[ORM\Column(type: 'decimal', precision: 10, scale: 2)]
    private float $prixUnitaire;

    public function getId(): ?int { return $this->id; }
    public function getCommande(): Commande { return $this->commande; }
    public function setCommande(Commande $commande): void { $this->commande = $commande; }
    public function getProduit(): Produit { return $this->produit; }
    public function setProduit(Produit $produit): void { $this->produit = $produit; }
    public function getQuantite(): int { return $this->quantite; }
    public function setQuantite(int $quantite): void { $this->quantite = $quantite; }
    public function getPrixUnitaire(): float { return $this->prixUnitaire; }
    public function setPrixUnitaire(float $prix): void { $this->prixUnitaire = $prix; }
}
