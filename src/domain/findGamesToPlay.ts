import type { Game } from "./game";
import type { GameDetails } from "./gameDetails";
import { compareProfiles } from "./comparaison";
import { filterMultiplayer } from "./filterMultiplayer";
import { sortByPrice } from "./sortByPrice";
import type { LibraryProvider } from "../ports/libraryProvider";
import type { WishlistProvider } from "../ports/wishlistProvider";
import type { GameDetailsProvider } from "../ports/gameDetailsProvider";

// Les sources de données dont le service a besoin
export interface Providers {
    library: LibraryProvider;
    wishlist: WishlistProvider;
    details: GameDetailsProvider;
}

// Le résultat final, prêt à être affiché
export interface PlayTogetherReport {
    commonGames: GameDetails[];          // multi, triés par nom
    ownedByAWishedByB: GameDetails[];    // multi, triés par prix
    ownedByBWishedByA: GameDetails[];    // multi, triés par prix
    sharedWishlist: GameDetails[];       // multi, triés par prix
}

export async function findGamesToPlay(
    playerA: string,
    playerB: string,
    providers: Providers,
): Promise<PlayTogetherReport> {
    // 1. Bibliothèques et wishlists des deux joueurs, en parallèle
    const [libraryA, wishlistA, libraryB, wishlistB] = await Promise.all([
        providers.library.getLibrary(playerA),
        providers.wishlist.getWishlist(playerA),
        providers.library.getLibrary(playerB),
        providers.wishlist.getWishlist(playerB),
    ]);

    // 2. Les quatre croisements
    const result = compareProfiles(
        { library: libraryA, wishlist: wishlistA },
        { library: libraryB, wishlist: wishlistB },
    );

    // 3. Les détails, une seule fois par jeu, uniquement pour les jeux issus des croisements.
    //    Demandés dans l'ordre d'utilité (wishlist commune, jeux voulus par l'autre, jeux en commun) :
    //    si le fournisseur limite ses appels, ce sont les moins utiles qui manqueront.
    const prioritizedIds = [...new Set([
        ...result.sharedWishlist,
        ...idsOf(result.ownedByAWishedByB),
        ...idsOf(result.ownedByBWishedByA),
        ...idsOf(result.commonGames),
    ])];
    const allDetails = await Promise.all(prioritizedIds.map(id => providers.details.getGameDetails(id)));

    const detailsById = new Map<string, GameDetails>();
    for (const details of allDetails) {
        if (details) {
            detailsById.set(details.id, details);
        }
    }

    // Retrouve les détails de chaque id ; les jeux introuvables sont ignorés
    function detailsOf(gameIds: string[]): GameDetails[] {
        return gameIds
            .map(id => detailsById.get(id))
            .filter(details => details !== undefined);
    }

    // 4. Les quatre listes finales : détails → multijoueur seulement → tri
    return {
        commonGames: filterMultiplayer(detailsOf(idsOf(result.commonGames)))
            .toSorted((a, b) => a.name.localeCompare(b.name)),
        ownedByAWishedByB: sortByPrice(filterMultiplayer(detailsOf(idsOf(result.ownedByAWishedByB)))),
        ownedByBWishedByA: sortByPrice(filterMultiplayer(detailsOf(idsOf(result.ownedByBWishedByA)))),
        sharedWishlist: sortByPrice(filterMultiplayer(detailsOf(result.sharedWishlist))),
    };
}

function idsOf(games: Game[]): string[] {
    return games.map(game => game.id);
}
