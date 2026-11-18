export type SteamInput =
    | { kind: "steamId"; steamId: string }
    | { kind: "vanity"; vanityName: string }
    | { kind: "invalid" };

const STEAM_ID = /^7656119\d{10}$/;                                  // 17 chiffres, commence par 7656119
const PROFILE_URL = /steamcommunity\.com\/profiles\/(7656119\d{10})/; // capture le SteamID
const VANITY_URL = /steamcommunity\.com\/id\/([^/]+)/;               // capture le pseudo
const VANITY_NAME = /^[A-Za-z0-9_-]{2,32}$/;// forme d'un pseudo d'URL Steam

export function parseSteamInput(input: string): SteamInput {
    const text = input.trim();   // retire les espaces autour

    // 1. un SteamID seul ?
    if (STEAM_ID.test(text)) {
        return {kind: "steamId", steamId: text}
    }

    // 2. une URL /profiles/... ?
    const steamIdFromUrl = text.match(PROFILE_URL)?.[1];
    if (steamIdFromUrl) {
        return { kind: "steamId", steamId: steamIdFromUrl };
    }

    // 3. une URL /id/... ?
    const steamVanityName = text.match(VANITY_URL)?.[1];
    if (steamVanityName) {
        return { kind: "vanity", vanityName: steamVanityName };
    }

    // 4. un pseudo seul ?
    if (VANITY_NAME.test(text)) {
        return { kind: "vanity", vanityName: text };
    }
    // 5. sinon
    return { kind: "invalid" };
}