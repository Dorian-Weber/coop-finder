import { describe, it, expect } from "vitest";
import { CachedGameDetailsProvider } from "../../../src/adapters/decorators/cachedGameDetailsProvider";
import { InMemoryGameDetailsCache } from "../../../src/adapters/memory/inMemoryGameDetailsCache";
import type { GameDetails } from "../../../src/domain/gameDetails";
import type { GameDetailsProvider } from "../../../src/ports/gameDetailsProvider";
import { makeGameDetails } from "../../helpers/makeGameDetails";

const ONE_HOUR = 60 * 60 * 1000;

// Un faux fournisseur qui compte ses appels
function makeCountingProvider(games: GameDetails[]) {
    const provider = {
        calls: 0,
        async getGameDetails(gameId: string) {
            provider.calls++;
            return games.find(game => game.id === gameId);
        },
    } satisfies GameDetailsProvider & { calls: number };
    return provider;
}

describe("CachedGameDetailsProvider", () => {
    it("demande au fournisseur et enregistre le résultat quand le jeu n'est pas en cache", async () => {
        const inner = makeCountingProvider([makeGameDetails({ id: "1", name: "Among Us" })]);
        const cache = new InMemoryGameDetailsCache();
        const provider = new CachedGameDetailsProvider(inner, cache, ONE_HOUR, () => 1000);

        const result = await provider.getGameDetails("1");

        expect(result?.name).toBe("Among Us");
        expect(inner.calls).toBe(1);
        expect((await cache.get("1"))?.cachedAt).toBe(1000);
    });

    it("n'appelle pas le fournisseur quand le jeu est en cache et récent", async () => {
        const inner = makeCountingProvider([]);
        const cache = new InMemoryGameDetailsCache();
        await cache.set(makeGameDetails({ id: "1", name: "Among Us" }), 0);
        const provider = new CachedGameDetailsProvider(inner, cache, ONE_HOUR, () => ONE_HOUR / 2);

        const result = await provider.getGameDetails("1");

        expect(result?.name).toBe("Among Us");
        expect(inner.calls).toBe(0);
    });

    it("redemande au fournisseur quand le cache est trop vieux", async () => {
        const inner = makeCountingProvider([makeGameDetails({ id: "1", name: "Among Us (à jour)" })]);
        const cache = new InMemoryGameDetailsCache();
        await cache.set(makeGameDetails({ id: "1", name: "Among Us (ancien)" }), 0);
        const provider = new CachedGameDetailsProvider(inner, cache, ONE_HOUR, () => 2 * ONE_HOUR);

        const result = await provider.getGameDetails("1");

        expect(result?.name).toBe("Among Us (à jour)");
        expect(inner.calls).toBe(1);
    });

    it("renvoie les anciens détails si le fournisseur ne répond pas", async () => {
        const inner = makeCountingProvider([]);   // ne trouve rien (budget épuisé, par exemple)
        const cache = new InMemoryGameDetailsCache();
        await cache.set(makeGameDetails({ id: "1", name: "Among Us (ancien)" }), 0);
        const provider = new CachedGameDetailsProvider(inner, cache, ONE_HOUR, () => 2 * ONE_HOUR);

        const result = await provider.getGameDetails("1");

        expect(result?.name).toBe("Among Us (ancien)");
    });

    it("renvoie undefined et n'enregistre rien pour un jeu introuvable", async () => {
        const inner = makeCountingProvider([]);
        const cache = new InMemoryGameDetailsCache();
        const provider = new CachedGameDetailsProvider(inner, cache, ONE_HOUR, () => 0);

        expect(await provider.getGameDetails("1")).toBeUndefined();
        expect(await cache.get("1")).toBeUndefined();
    });
});
