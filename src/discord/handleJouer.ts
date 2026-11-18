import { findGamesToPlay } from "../domain/findGamesToPlay";
import { SteamLibraryProvider } from "../adapters/steam/steamLibraryProvider";
import { SteamWishlistProvider } from "../adapters/steam/steamWishlistProvider";
import { SteamGameDetailsProvider } from "../adapters/steam/steamGameDetailsProvider";
import { formatReport } from "./formatReport";
import { editOriginalResponse } from "./editOriginalResponse";

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
        const providers = {
            library: new SteamLibraryProvider(env.STEAM_API_KEY),
            wishlist: new SteamWishlistProvider(),
            details: new SteamGameDetailsProvider(),
        };
        const report = await findGamesToPlay(request.steamIdA, request.steamIdB, providers);
        content = formatReport(report, request.labelA, request.labelB);
    } catch (error) {
        // Sans ça, l'utilisateur resterait bloqué sur « réfléchit… »
        console.error(error);
        content = "😕 Impossible de comparer ces comptes. Vérifie les SteamID et que les profils, bibliothèques et wishlists sont publics.";
    }

    await editOriginalResponse(env.DISCORD_APPLICATION_ID, request.interactionToken, content);
}
