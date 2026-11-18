import { SteamAccountResolver } from "../adapters/steam/steamAccountResolver";
import { D1UserLinkRepository } from "../adapters/d1/d1UserLinkRepository";
import { editOriginalResponse } from "./editOriginalResponse";

export interface LierRequest {
    discordUserId: string;
    input: string;              // ce que l'utilisateur a tapé
    interactionToken: string;
}

// Exécutée en arrière-plan : la résolution d'un pseudo interroge Steam
export async function handleLier(request: LierRequest, env: Env): Promise<void> {
    let content: string;

    try {
        const resolver = new SteamAccountResolver(env.STEAM_API_KEY);
        const steamId = await resolver.resolve(request.input);

        if (!steamId) {
            content = "❌ Compte Steam introuvable. Indique ton pseudo d'URL (steamcommunity.com/id/**pseudo**), l'adresse de ton profil ou ton SteamID64.";
        } else {
            const repository = new D1UserLinkRepository(env.DB);
            await repository.link(request.discordUserId, steamId);
            content = `✅ Compte Steam associé : <https://steamcommunity.com/profiles/${steamId}>\nVérifie que ton profil, ta bibliothèque et ta wishlist sont publics.`;
        }
    } catch (error) {
        console.error(error);
        content = "😕 Une erreur est survenue, réessaie dans un instant.";
    }

    await editOriginalResponse(env.DISCORD_APPLICATION_ID, request.interactionToken, content);
}
