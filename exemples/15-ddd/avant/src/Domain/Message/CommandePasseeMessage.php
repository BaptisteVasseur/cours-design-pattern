<?php

namespace App\Domain\Message;

class CommandePasseeMessage
{
    public function __construct(
        public readonly int    $commandeId,
        public readonly string $clientEmail,
        public readonly float  $total,
    ) {}
}
