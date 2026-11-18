import type { Providers } from "../../src/domain/findGamesToPlay";
import type { Game } from "../../src/domain/game";
import type { GameDetails } from "../../src/domain/gameDetails";

// Des fournisseurs en mémoire : chaque joueur et chaque jeu sont décrits à la main
export function makeFakeProviders(data: {
    libraries: Record<string, Game[]>;
    wishlists: Record<string, string[]>;
    details: GameDetails[];
}): Providers {
    return {
        library: { getLibrary: async (playerId: string) => data.libraries[playerId] ?? [] },
        wishlist: { getWishlist: async (playerId: string ) => data.wishlists[playerId] ?? [] },
        details: { getGameDetails: async (gameId: string ) => data.details.find(game => game.id === gameId) },
    };
}