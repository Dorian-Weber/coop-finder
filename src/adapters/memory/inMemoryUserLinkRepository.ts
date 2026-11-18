import type { UserLinkRepository } from "../../ports/userLinkRepository";

// Version en mémoire du dépôt : pour les tests et le développement local.
// Les données disparaissent à chaque redémarrage.
export class InMemoryUserLinkRepository implements UserLinkRepository {
    private readonly links = new Map<string, string>();   // identifiant Discord → SteamID

    async getSteamId(discordUserId: string): Promise<string | undefined> {
        return this.links.get(discordUserId);
    }

    async link(discordUserId: string, steamId: string): Promise<void> {
        this.links.set(discordUserId, steamId);
    }

    async unlink(discordUserId: string): Promise<void> {
        this.links.delete(discordUserId);
    }
}