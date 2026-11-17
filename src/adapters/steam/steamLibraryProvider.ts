import type { LibraryProvider } from "../../ports/libraryProvider";
import type { Game } from "../../domain/game";
import { fetchOwnedGames } from "./fetchOwnedGames";

export class SteamLibraryProvider implements LibraryProvider {
    constructor(private readonly apiKey: string) {}

    getLibrary(playerId: string): Promise<Game[]> {
        return fetchOwnedGames(playerId, this.apiKey);
    }
}