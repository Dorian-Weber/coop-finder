import type { ResolveVanityUrlResponse } from "./types";

const STEAM_RESOLVE_VANITY_URL = "https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/";

// Transforme un pseudo d'URL Steam en SteamID64, ou undefined s'il n'existe pas
export async function resolveVanityUrl(vanityName: string, apiKey: string): Promise<string | undefined> {

    // 1. construire l'URL avec les paramètres "key" et "vanityurl"
    const url = new URL(STEAM_RESOLVE_VANITY_URL);
    url.searchParams.set("key", apiKey);
    url.searchParams.set("vanityurl", vanityName);

    // 2. appeler l'API et lever une erreur si response.ok est faux
    const response = await fetch(url);

    // 3. lire le JSON avec le type ResolveVanityUrlResponse
    if (!response.ok) {
        throw new Error(`impossible de résoudre Vanity URL: ${response.status} ${response.statusText}`);
    }

    // 4. si data.response.success === 1, renvoyer data.response.steamid, sinon undefined
    const data = (await response.json()) as ResolveVanityUrlResponse;
    if (data.response.success === 1) {
        return data.response.steamid;   // TypeScript sait qu'on est dans le cas « trouvé »
    }
    return undefined;
}
