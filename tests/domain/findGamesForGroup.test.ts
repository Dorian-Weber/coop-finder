import { describe, it, expect } from "vitest";
import { findGamesForGroup } from "../../src/domain/findGamesForGroup";
import { makeFakeProviders } from "../helpers/fakeProviders";
import { makeGame } from "../helpers/makeGame";
import { makeGameDetails } from "../helpers/makeGameDetails";

describe("findGamesForGroup", () => {
    it("ne garde que les jeux multi, avec leurs détails, dans le bon ordre", async () => {
        const providers = makeFakeProviders({
            libraries: {
                A: [makeGame(1, "Portal 2"), makeGame(2, "Among Us"), makeGame(3, "Skyrim"), makeGame(4, "Valheim")],
                B: [makeGame(1, "Portal 2"), makeGame(2, "Among Us"), makeGame(3, "Skyrim"), makeGame(4, "Valheim")],
                C: [makeGame(1, "Portal 2"), makeGame(2, "Among Us"), makeGame(3, "Skyrim")],
            },
            wishlists: {
                A: ["8", "9"],
                B: ["8", "9"],
                C: ["9"],
            },
            details: [
                makeGameDetails({ id: "1", name: "Portal 2", isMultiplayer: true }),
                makeGameDetails({ id: "2", name: "Among Us", isMultiplayer: true }),
                makeGameDetails({ id: "3", name: "Skyrim", isMultiplayer: false }),
                makeGameDetails({ id: "4", name: "Valheim", isMultiplayer: true }),
                makeGameDetails({ id: "8", name: "Deep Rock Galactic", isMultiplayer: true }),
                makeGameDetails({ id: "9", name: "Lethal Company", isMultiplayer: true }),
            ],
        });

        const report = await findGamesForGroup(["A", "B", "C"], providers);

        expect(report.playableByAll.map(game => game.id)).toEqual(["2", "1"]);   // Skyrim exclu (solo), tri par nom
        expect(report.missingOne.map(entry => [entry.game.id, entry.missingPlayerId])).toEqual([["4", "C"]]);
        expect(report.wishedByMany.map(entry => entry.game.id)).toEqual(["9", "8"]);   // 3 intéressés avant 2
    });
});
