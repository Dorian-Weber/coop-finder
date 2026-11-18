import type { UserLinkRepository } from "../../ports/userLinkRepository";

// Version D1 du dépôt : les liens sont conservés dans la table user_links
export class D1UserLinkRepository implements UserLinkRepository {
    constructor(private readonly db: D1Database) {}

    async getSteamId(discordUserId: string): Promise<string | undefined> {
        const row = await this.db
            .prepare("SELECT steam_id FROM user_links WHERE discord_user_id = ?")
            .bind(discordUserId)
            .first<{ steam_id: string }>();
        return row?.steam_id;
    }

    async link(discordUserId: string, steamId: string): Promise<void> {
        await this.db
            .prepare(`
                INSERT INTO user_links (discord_user_id, steam_id) VALUES (?, ?)
                ON CONFLICT (discord_user_id) DO UPDATE SET
                    steam_id = excluded.steam_id,
                    linked_at = datetime('now')
            `)
            .bind(discordUserId, steamId)
            .run();
    }

    async unlink(discordUserId: string): Promise<void> {
        await this.db
            .prepare("DELETE FROM user_links WHERE discord_user_id = ?")
            .bind(discordUserId)
            .run();
    }
}