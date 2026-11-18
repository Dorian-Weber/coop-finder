import type { Game } from "./game";

// Ce qu'on sait d'un membre du groupe
export interface GroupMember {
    playerId: string;
    library: Game[];
    wishlist: string[];   // ids uniquement
}

export interface GroupComparison {
    ownedByAll: string[];                                                  // ids possédés par tout le monde
    missingOne: { gameId: string; missingPlayerId: string }[];             // possédés par tous sauf un
    wishedByMany: { gameId: string; interestedPlayerIds: string[] }[];     // dans au moins deux wishlists
}

// Croise les bibliothèques et wishlists d'un groupe de joueurs (2 ou plus)
export function compareGroup(members: GroupMember[]): GroupComparison {
    // Pour chaque jeu, qui le possède (un Set : un joueur ne compte qu'une fois)
    const ownersByGame = new Map<string, Set<string>>();
    for (const member of members) {
        for (const game of member.library) {
            const owners = ownersByGame.get(game.id) ?? new Set<string>();
            owners.add(member.playerId);
            ownersByGame.set(game.id, owners);
        }
    }

    const ownedByAll: string[] = [];
    const missingOne: GroupComparison["missingOne"] = [];
    for (const [gameId, owners] of ownersByGame) {
        if (owners.size === members.length) {
            ownedByAll.push(gameId);
        } else if (members.length >= 3 && owners.size === members.length - 1) {
            // À deux, « il manque une personne » voudrait dire « tous les jeux d'un seul joueur » : sans intérêt
            const missing = members.find(member => !owners.has(member.playerId));
            if (missing) {
                missingOne.push({ gameId, missingPlayerId: missing.playerId });
            }
        }
    }

    // Pour chaque jeu souhaité, qui le veut
    const wishersByGame = new Map<string, Set<string>>();
    for (const member of members) {
        for (const gameId of member.wishlist) {
            const wishers = wishersByGame.get(gameId) ?? new Set<string>();
            wishers.add(member.playerId);
            wishersByGame.set(gameId, wishers);
        }
    }

    const wishedByMany: GroupComparison["wishedByMany"] = [];
    for (const [gameId, wishers] of wishersByGame) {
        if (wishers.size >= 2) {
            wishedByMany.push({ gameId, interestedPlayerIds: [...wishers] });
        }
    }

    return { ownedByAll, missingOne, wishedByMany };
}
