import { describe, it, expect } from "vitest";
import { BudgetedGameDetailsProvider } from "../../../src/adapters/decorators/budgetedGameDetailsProvider";
import type { GameDetailsProvider } from "../../../src/ports/gameDetailsProvider";
import { makeGameDetails } from "../../helpers/makeGameDetails";

// Un faux fournisseur qui trouve n'importe quel jeu
const alwaysFound: GameDetailsProvider = {
    getGameDetails: async (gameId) => makeGameDetails({ id: gameId }),
};

describe("BudgetedGameDetailsProvider", () => {
    it("transmet les appels tant que le budget le permet", async () => {
        const provider = new BudgetedGameDetailsProvider(alwaysFound, 2);

        expect((await provider.getGameDetails("1"))?.id).toBe("1");
        expect((await provider.getGameDetails("2"))?.id).toBe("2");
        expect(provider.skippedCount).toBe(0);
    });

    it("renvoie undefined une fois le budget épuisé, et compte les jeux refusés", async () => {
        const provider = new BudgetedGameDetailsProvider(alwaysFound, 1);

        await provider.getGameDetails("1");
        const refused = await Promise.all([provider.getGameDetails("2"), provider.getGameDetails("3")]);

        expect(refused).toEqual([undefined, undefined]);
        expect(provider.skippedCount).toBe(2);
    });

    it("respecte le budget même quand les appels partent en parallèle", async () => {
        const provider = new BudgetedGameDetailsProvider(alwaysFound, 2);

        const results = await Promise.all(["1", "2", "3", "4"].map(id => provider.getGameDetails(id)));

        expect(results.filter(result => result !== undefined)).toHaveLength(2);
        expect(provider.skippedCount).toBe(2);
    });
});
