<?php

namespace App\MessageHandler;

use App\Domain\Entity\Commande;
use App\Domain\Message\CommandePasseeMessage;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;
use Symfony\Component\Mime\Email;
use Twig\Environment;

#[AsMessageHandler]
class CommandePasseeMessageHandler
{
    public function __construct(
        private EntityManagerInterface $em,
        private MailerInterface        $mailer,
        private Environment            $twig,
    ) {}

    public function __invoke(CommandePasseeMessage $message): void
    {
        $commande = $this->em->getRepository(Commande::class)->find($message->commandeId);

        if (!$commande) {
            return;
        }

        $html = $this->twig->render('email/confirmation_commande.html.twig', [
            'commande' => $commande,
        ]);

        $email = (new Email())
            ->from('boutique@exemple.fr')
            ->to($message->clientEmail)
            ->subject("Confirmation de votre commande #{$message->commandeId}")
            ->html($html);

        $this->mailer->send($email);
    }
}
