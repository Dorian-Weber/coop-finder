// Définition des commandes slash, telles que Discord les attend.
// Partagée entre le script d'enregistrement et le Worker.

// Types d'option Discord : 3 = texte, 6 = utilisateur
const STRING_OPTION = 3;
const USER_OPTION = 6;

export const JOUER_COMMAND = {
    name: "jouer",
    description: "Trouve à quoi jouer avec un ami, à partir de vos comptes Steam liés",
    options: [
        {
            type: USER_OPTION,
            name: "joueur",
            description: "La personne avec qui tu veux jouer",
            required: true,
        },
    ],
};

export const LIER_COMMAND = {
    name: "lier",
    description: "Associe ton compte Steam à ton compte Discord",
    options: [
        {
            type: STRING_OPTION,
            name: "compte",
            description: "Ton pseudo d'URL Steam, l'adresse de ton profil ou ton SteamID64",
            required: true,
        },
    ],
};

export const DELIER_COMMAND = {
    name: "delier",
    description: "Supprime l'association entre ton compte Steam et ton compte Discord",
};

export const ALL_COMMANDS = [JOUER_COMMAND, LIER_COMMAND, DELIER_COMMAND];
