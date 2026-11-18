import type { GameDetails } from "../../domain/gameDetails";
import type { CachedGameDetails, GameDetailsCache } from "../../ports/gameDetailsCache";

// Version en mémoire du cache : pour les tests
export class InMemoryGameDetailsCache implements GameDetailsCache {
    private readonly entries = new Map<string, CachedGameDetails>();

    async get(gameId: string): Promise<CachedGameDetails | undefined> {
        return this.entries.get(gameId);
    }

    async set(details: GameDetails, cachedAt: number): Promise<void> {
        this.entries.set(details.id, { details, cachedAt });
    }
}
