import type { GameDetails } from "../../domain/gameDetails";
import type { CachedGameDetails, GameDetailsCache } from "../../ports/gameDetailsCache";

// Version D1 du cache : table game_details_cache
export class D1GameDetailsCache implements GameDetailsCache {
    constructor(private readonly db: D1Database) {}

    async get(gameId: string): Promise<CachedGameDetails | undefined> {
        const row = await this.db
            .prepare("SELECT details_json, cached_at FROM game_details_cache WHERE game_id = ?")
            .bind(gameId)
            .first<{ details_json: string; cached_at: number }>();

        if (!row) {
            return undefined;
        }
        return { details: JSON.parse(row.details_json) as GameDetails, cachedAt: row.cached_at };
    }

    async set(details: GameDetails, cachedAt: number): Promise<void> {
        await this.db
            .prepare(`
                INSERT INTO game_details_cache (game_id, details_json, cached_at) VALUES (?, ?, ?)
                ON CONFLICT (game_id) DO UPDATE SET
                    details_json = excluded.details_json,
                    cached_at = excluded.cached_at
            `)
            .bind(details.id, JSON.stringify(details), cachedAt)
            .run();
    }
}
