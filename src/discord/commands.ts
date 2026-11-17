// Définition des commandes slash, telles que Discord les attend.
// Partagée entre le script d'enregistrement et le Worker.

// Type d'option Discord : 3 = texte
const STRING_OPTION = 3;

export const JOUER_COMMAND = {
    name: "jouer",
    description: "Trouve à quoi jouer à deux à partir de vos comptes Steam",
    options: [
        {
            type: STRING_OPTION,
            name: "steam_a",
            description: "SteamID64 du premier joueur (17 chiffres)",
            required: true,
        },
        {
            type: STRING_OPTION,
            name: "steam_b",
            description: "SteamID64 du second joueur (17 chiffres)",
            required: true,
        },
    ],
};

export const ALL_COMMANDS = [JOUER_COMMAND];
