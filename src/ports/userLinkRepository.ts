// Enregistre le compte Steam associé à chaque utilisateur Discord
export interface UserLinkRepository {
    getSteamId(discordUserId: string): Promise<string | undefined>;
    link(discordUserId: string, steamId: string): Promise<void>;
    unlink(discordUserId: string): Promise<void>;
}