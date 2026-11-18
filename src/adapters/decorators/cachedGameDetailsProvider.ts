import type { GameDetails } from "../../domain/gameDetails";
import type { GameDetailsProvider } from "../../ports/gameDetailsProvider";
import type { GameDetailsCache } from "../../ports/gameDetailsCache";

// Décorateur : consulte le cache avant de déléguer à un autre fournisseur.
// - détails récents en cache → renvoyés directement, sans appel
// - absents ou trop vieux → demandés au fournisseur, puis enregistrés
// - si le fournisseur ne répond pas (budget épuisé…) → les anciens détails valent mieux que rien
export class CachedGameDetailsProvider implements GameDetailsProvider {
    constructor(
        private readonly inner: GameDetailsProvider,
        private readonly cache: GameDetailsCache,
        private readonly maxAgeMs: number,
        private readonly now: () => number = () => Date.now(),   // remplaçable dans les tests
    ) {}

    async getGameDetails(gameId: string): Promise<GameDetails | undefined> {
        const cached = await this.cache.get(gameId);
        if (cached && this.now() - cached.cachedAt < this.maxAgeMs) {
            return cached.details;
        }

        const fresh = await this.inner.getGameDetails(gameId);
        if (fresh) {
            await this.cache.set(fresh, this.now());
            return fresh;
        }

        return cached?.details;
    }
}
