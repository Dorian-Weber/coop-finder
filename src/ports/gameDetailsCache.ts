import type { GameDetails } from "../domain/gameDetails";

export interface CachedGameDetails {
    details: GameDetails;
    cachedAt: number;   // millisecondes depuis le 1er janvier 1970 (Date.now())
}

// Stocke des détails de jeux déjà récupérés, avec leur date d'enregistrement
export interface GameDetailsCache {
    get(gameId: string): Promise<CachedGameDetails | undefined>;
    set(details: GameDetails, cachedAt: number): Promise<void>;
}
