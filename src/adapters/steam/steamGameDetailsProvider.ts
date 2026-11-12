import type {GameDetailsProvider} from "../../ports/gameDetailsProvider";
import type {GameDetails} from "../../domain/gameDetails";
import {fetchGameDetails} from "./fetchGameDetails";

export class SteamGameDetailsProvider implements GameDetailsProvider {
    getGameDetails(gameId: string): Promise<GameDetails | undefined> {
        return fetchGameDetails(gameId);
    }
}