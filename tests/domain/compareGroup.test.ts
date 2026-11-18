import { describe, it, expect } from "vitest";
import { compareGroup } from "../../src/domain/compareGroup";
import { makeGame } from "../helpers/makeGame";

describe("compareGroup", () => {
    const members = [
        { playerId: "A", library: [makeGame(1, "Among Us"), makeGame(2, "Portal 2")], wishlist: ["7", "8"] },
        { playerId: "B", library: [makeGame(1, "Among Us"), makeGame(2, "Portal 2")], wishlist: ["7"] },
        { playerId: "C", library: [makeGame(1, "Among Us"), makeGame(3, "Valheim")], wishlist: ["7", "8", "9"] },
    ];

    it("trouve les jeux possédés par tout le monde", () => {
        expect(compareGroup(members).ownedByAll).toEqual(["1"]);
    });

    it("trouve les jeux possédés par tous sauf un, et indique qui manque", () => {
        expect(compareGroup(members).missingOne).toEqual([{ gameId: "2", missingPlayerId: "C" }]);
    });

    it("trouve les jeux voulus par au moins deux personnes", () => {
        const wished = compareGroup(members).wishedByMany;

        expect(wished).toEqual([
            { gameId: "7", interestedPlayerIds: ["A", "B", "C"] },
            { gameId: "8", interestedPlayerIds: ["A", "C"] },
        ]);
    });

    it("ne propose pas « il manque une personne » à deux joueurs", () => {
        const duo = members.slice(0, 2).map((member, i) => (i === 1 ? { ...member, library: [makeGame(1, "Among Us")] } : member));

        expect(compareGroup(duo).missingOne).toEqual([]);
    });

    it("ne compte qu'une fois un jeu présent en double dans une bibliothèque", () => {
        const group = [
            { playerId: "A", library: [makeGame(1, "Among Us"), makeGame(1, "Among Us")], wishlist: [] },
            { playerId: "B", library: [], wishlist: [] },
        ];

        expect(compareGroup(group).ownedByAll).toEqual([]);
    });
});
