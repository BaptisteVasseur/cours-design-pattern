<?php

class User
{
    public function __construct(
        public string $name,
        public string $email,
        public string $phone
    ) {}
}

# S : Single Responsibility Principle -> Une classe doit avoir une seule responsabilité.
# O : Open/Closed Principle -> Une classe doit être ouverte à l'extension mais fermée à la modification.
# L : Liskov Substitution Principle -> Les objets d'une classe dérivée doivent pouvoir remplacer les objets de la classe de base sans altérer le fonctionnement du programme.
# I : Interface Segregation Principle -> Les clients ne doivent pas être forcés de dépendre d'interfaces qu'ils n'utilisent pas.
# D : Dependency Inversion Principle -> Les modules de haut niveau ne doivent pas dépendre des modules de bas niveau. Les deux doivent dépendre d'abstractions.
