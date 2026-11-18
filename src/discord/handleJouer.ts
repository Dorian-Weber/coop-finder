import { findGamesToPlay } from "../domain/findGamesToPlay";
import { SteamLibraryProvider } from "../adapters/steam/steamLibraryProvider";
import { SteamWishlistProvider } from "../adapters/steam/steamWishlistProvider";
import { SteamGameDetailsProvider } from "../adapters/steam/steamGameDetailsProvider";
import { BudgetedGameDetailsProvider } from "../adapters/decorators/budgetedGameDetailsProvider";
import { CachedGameDetailsProvider } from "../adapters/decorators/cachedGameDetailsProvider";
import { D1GameDetailsCache } from "../adapters/d1/d1GameDetailsCache";
import { formatReport } from "./formatReport";
import { editOriginalResponse } from "./editOriginalResponse";

// Le palier gratuit de Cloudflare autorise 50 appels externes par requête :
// 4 pour les bibliothèques et wishlists, 1 pour modifier le message, le reste pour Steam (avec de la marge).
// Les lectures dans D1 ne comptent pas dans cette limite.
const MAX_STEAM_DETAILS_CALLS = 40;

// Durée de validité des détails en cache : les prix changent, surtout pendant les soldes
const DETAILS_CACHE_MAX_AGE_MS = 12 * 60 * 60 * 1000;   // 12 heures

// Ce dont la commande a besoin, extrait de l'interaction Discord
export interface JouerRequest {
    steamIdA: string;
    steamIdB: string;
    labelA: string;             // comment désigner chaque joueur dans le message (mention Discord)
    labelB: string;
    interactionToken: string;
}

// Exécutée en arrière-plan, après la réponse différée
export async function handleJouer(request: JouerRequest, env: Env): Promise<void> {
    let content: string;

    try {
        // Cache D1 → budget d'appels → Steam : chaque couche ajoute un seul comportement
        const steamWithBudget = new BudgetedGameDetailsProvider(new SteamGameDetailsProvider(), MAX_STEAM_DETAILS_CALLS);
        const providers = {
            library: new SteamLibraryProvider(env.STEAM_API_KEY),
            wishlist: new SteamWishlistProvider(),
            details: new CachedGameDetailsProvider(steamWithBudget, new D1GameDetailsCache(env.DB), DETAILS_CACHE_MAX_AGE_MS),
        };
        const report = await findGamesToPlay(request.steamIdA, request.steamIdB, providers);
        content = formatReport(report, request.labelA, request.labelB, steamWithBudget.skippedCount);
    } catch (error) {
        // Sans ça, l'utilisateur resterait bloqué sur « réfléchit… »
        console.error(error);
        content = "😕 Impossible de comparer ces comptes. Vérifie les SteamID et que les profils, bibliothèques et wishlists sont publics.";
    }

    await editOriginalResponse(env.DISCORD_APPLICATION_ID, request.interactionToken, content);
}
