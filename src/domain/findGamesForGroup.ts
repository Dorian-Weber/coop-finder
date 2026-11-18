import type { GameDetails } from "./gameDetails";
import type { Providers } from "./findGamesToPlay";
import { compareGroup, type GroupMember } from "./compareGroup";
import { priceSortKey } from "./sortByPrice";

export interface GroupReport {
    playableByAll: GameDetails[];                                              // multi, triés par nom
    missingOne: { game: GameDetails; missingPlayerId: string }[];              // multi, triés par prix
    wishedByMany: { game: GameDetails; interestedPlayerIds: string[] }[];      // multi, les plus demandés d'abord, puis par prix
}

export async function findGamesForGroup(playerIds: string[], providers: Providers): Promise<GroupReport> {
    // 1. Bibliothèques et wishlists de tout le groupe, en parallèle
    const members: GroupMember[] = await Promise.all(playerIds.map(async playerId => {
        const [library, wishlist] = await Promise.all([
            providers.library.getLibrary(playerId),
            providers.wishlist.getWishlist(playerId),
        ]);
        return { playerId, library, wishlist };
    }));

    // 2. Les croisements
    const comparison = compareGroup(members);

    // 3. Les détails, une fois par jeu, dans l'ordre d'utilité : envies communes, puis jeux à un joueur près, puis jeux de tous
    const prioritizedIds = [...new Set([
        ...comparison.wishedByMany.map(entry => entry.gameId),
        ...comparison.missingOne.map(entry => entry.gameId),
        ...comparison.ownedByAll,
    ])];
    const allDetails = await Promise.all(prioritizedIds.map(id => providers.details.getGameDetails(id)));

    const detailsById = new Map<string, GameDetails>();
    for (const details of allDetails) {
        if (details) {
            detailsById.set(details.id, details);
        }
    }

    // Ne garde que les jeux multi dont on connaît les détails
    const multiplayerDetails = (gameId: string): GameDetails | undefined => {
        const details = detailsById.get(gameId);
        return details?.isMultiplayer ? details : undefined;
    };

    // 4. Les trois listes finales
    const playableByAll = comparison.ownedByAll
        .map(multiplayerDetails)
        .filter(game => game !== undefined)
        .toSorted((a, b) => a.name.localeCompare(b.name));

    const missingOne = comparison.missingOne
        .flatMap(({ gameId, missingPlayerId }) => {
            const game = multiplayerDetails(gameId);
            return game ? [{ game, missingPlayerId }] : [];
        })
        .toSorted((a, b) => priceSortKey(a.game.price) - priceSortKey(b.game.price));

    const wishedByMany = comparison.wishedByMany
        .flatMap(({ gameId, interestedPlayerIds }) => {
            const game = multiplayerDetails(gameId);
            return game ? [{ game, interestedPlayerIds }] : [];
        })
        .toSorted((a, b) =>
            b.interestedPlayerIds.length - a.interestedPlayerIds.length
            || priceSortKey(a.game.price) - priceSortKey(b.game.price));

    return { playableByAll, missingOne, wishedByMany };
}
