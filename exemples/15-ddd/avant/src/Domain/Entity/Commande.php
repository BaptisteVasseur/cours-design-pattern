<?php

namespace App\Domain\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class Commande
{
    const STATUT_EN_ATTENTE = 'EN_ATTENTE';
    const STATUT_EXPEDIEE   = 'EXPEDIEE';
    const STATUT_ANNULEE    = 'ANNULEE';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(type: 'string', length: 255)]
    private string $clientEmail;

    #[ORM\Column(type: 'string', length: 50)]
    private string $statut = self::STATUT_EN_ATTENTE;

    #[ORM\Column(type: 'decimal', precision: 10, scale: 2)]
    private float $total = 0;

    #[ORM\Column(type: 'datetime')]
    private \DateTime $createdAt;

    #[ORM\OneToMany(mappedBy: 'commande', targetEntity: LigneCommande::class, cascade: ['persist'])]
    private Collection $lignes;

    public function __construct()
    {
        $this->lignes    = new ArrayCollection();
        $this->createdAt = new \DateTime();
    }

    public function getId(): ?int { return $this->id; }
    public function getClientEmail(): string { return $this->clientEmail; }
    public function setClientEmail(string $email): void { $this->clientEmail = $email; }
    public function getStatut(): string { return $this->statut; }
    public function setStatut(string $statut): void { $this->statut = $statut; }
    public function getTotal(): float { return $this->total; }
    public function setTotal(float $total): void { $this->total = $total; }
    public function getCreatedAt(): \DateTime { return $this->createdAt; }
    public function getLignes(): Collection { return $this->lignes; }
    public function addLigne(LigneCommande $ligne): void { $this->lignes->add($ligne); }
}
