import { findGamesForGroup } from "../domain/findGamesForGroup";
import { SteamLibraryProvider } from "../adapters/steam/steamLibraryProvider";
import { SteamWishlistProvider } from "../adapters/steam/steamWishlistProvider";
import { SteamGameDetailsProvider } from "../adapters/steam/steamGameDetailsProvider";
import { BudgetedGameDetailsProvider } from "../adapters/decorators/budgetedGameDetailsProvider";
import { CachedGameDetailsProvider } from "../adapters/decorators/cachedGameDetailsProvider";
import { D1GameDetailsCache } from "../adapters/d1/d1GameDetailsCache";
import { formatGroupReport } from "./formatGroupReport";
import { editOriginalResponse } from "./editOriginalResponse";

const DETAILS_CACHE_MAX_AGE_MS = 12 * 60 * 60 * 1000;   // 12 heures

// 50 appels externes par requête sur le palier gratuit : 2 par joueur (bibliothèque, wishlist),
// 1 pour modifier le message, 4 de marge ; le reste pour Steam
function steamDetailsBudget(playerCount: number): number {
    return Math.max(5, 50 - 2 * playerCount - 1 - 4);
}

export interface GroupeRequest {
    players: { steamId: string; label: string }[];   // auteur compris
    interactionToken: string;
}

// Exécutée en arrière-plan, après la réponse différée
export async function handleGroupe(request: GroupeRequest, env: Env): Promise<void> {
    let content: string;

    try {
        const steamWithBudget = new BudgetedGameDetailsProvider(
            new SteamGameDetailsProvider(),
            steamDetailsBudget(request.players.length),
        );
        const providers = {
            library: new SteamLibraryProvider(env.STEAM_API_KEY),
            wishlist: new SteamWishlistProvider(),
            details: new CachedGameDetailsProvider(steamWithBudget, new D1GameDetailsCache(env.DB), DETAILS_CACHE_MAX_AGE_MS),
        };

        const report = await findGamesForGroup(request.players.map(player => player.steamId), providers);
        const labels = Object.fromEntries(request.players.map(player => [player.steamId, player.label]));
        content = formatGroupReport(report, labels, steamWithBudget.skippedCount);
    } catch (error) {
        console.error(error);
        content = "😕 Impossible de comparer ce groupe. Vérifie que les profils, bibliothèques et wishlists de chacun sont publics.";
    }

    await editOriginalResponse(env.DISCORD_APPLICATION_ID, request.interactionToken, content);
}
