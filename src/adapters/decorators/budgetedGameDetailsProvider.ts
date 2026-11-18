import type { GameDetails } from "../../domain/gameDetails";
import type { GameDetailsProvider } from "../../ports/gameDetailsProvider";

// Décorateur : limite le nombre d'appels transmis au fournisseur.
// Au-delà du budget, répond « introuvable » et compte les jeux refusés.
// Un objet par commande : le compteur ne se remet jamais à zéro.
export class BudgetedGameDetailsProvider implements GameDetailsProvider {
    private calls = 0;
    private skipped = 0;

    constructor(
        private readonly inner: GameDetailsProvider,
        private readonly maxCalls: number,
    ) {}

    get skippedCount(): number {
        return this.skipped;
    }

    async getGameDetails(gameId: string): Promise<GameDetails | undefined> {
        if (this.calls >= this.maxCalls) {
            this.skipped++;
            return undefined;
        }
        this.calls++;
        return this.inner.getGameDetails(gameId);
    }
}
