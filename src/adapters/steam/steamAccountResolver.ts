import type {AccountResolver} from "../../ports/accountResolver";
import {parseSteamInput} from "./parseSteamInput";
import {resolveVanityUrl} from "./resolveVanityUrl";

export class SteamAccountResolver implements AccountResolver {
    constructor(private readonly apiKey: string) {}

    async resolve(input: string): Promise<string | undefined> {
        const parsed = parseSteamInput(input);

        switch (parsed.kind) {
            case "steamId":
                return parsed.steamId;                                // déjà un SteamID, rien à demander
            case "vanity":
                return resolveVanityUrl(parsed.vanityName, this.apiKey);
            case "invalid":
                return undefined;
        }
    }
}