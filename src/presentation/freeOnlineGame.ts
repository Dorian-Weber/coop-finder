// Jeux en ligne gratuits, jouables dans le navigateur sans installation.
// Proposés en fin de message : ajouter une idée = ajouter une ligne ici.
export interface FreeOnlineGame {
    name: string;
    url: string;
}

export const FREE_ONLINE_GAMES: FreeOnlineGame[] = [
    { name: "Codenames", url: "https://codenames.game" },
    { name: "Gartic Phone", url: "https://garticphone.com" },
    { name: "skribbl.io", url: "https://skribbl.io" },
];