import { describe, it , expect} from "vitest";
import {makeGame} from "../helpers/makeGame";
import {findGamesToPlay} from "../../src/domain/findGamesToPlay";
import {makeFakeProviders} from "../helpers/fakeProvider";
import {makeGameDetails} from "../helpers/makeGameDetails";

describe("findGamesToPlay", () => {
    it("renvoie les jeux multi en commun, triés par nom", async () => {
        const providers = makeFakeProviders({
            libraries: {
                A: [makeGame(1, "Portal 2"), makeGame(2, "Celeste"), makeGame(4, "Among Us")],
                B: [makeGame(1, "Portal 2"), makeGame(3, "Terraria"), makeGame(4, "Among Us")],
            },
            wishlists: {
                A: [],
                B: [],
            },
            details: [
                makeGameDetails({ id: "1", name: "Portal 2", isMultiplayer: true }),
                makeGameDetails({ id: "2", name: "Celeste", isMultiplayer: false }),
                makeGameDetails({ id: "3", name: "Terraria", isMultiplayer: true }),
                makeGameDetails({ id: "4", name: "Among Us", isMultiplayer: true }),
            ],
        });

        const result = await findGamesToPlay("A", "B", providers);
        expect(result.commonGames.map(game => game.id)).toEqual(["4", "1"]);
    });
    it("exclut les jeux solo de toutes les listes", async () => {
        const providers = makeFakeProviders({
            libraries: {
                A: [makeGame(1, "Skyrim"), makeGame(2, "Celeste")],
                B: [makeGame(1, "Skyrim"), makeGame(3, "Hollow knight")]
            },
            wishlists: {
                A: ["3", "5"],
                B: ["2", "5"],
            },
            details: [
                makeGameDetails({ id: "1", name: "Skyrim", isMultiplayer: false }),
                makeGameDetails({ id: "2", name: "Celeste", isMultiplayer: false }),
                makeGameDetails({ id: "3", name: "Hollow knight", isMultiplayer: false }),
            ],
        });

        const result = await findGamesToPlay("A", "B", providers);
        expect(result.commonGames).toEqual([]);
        expect(result.ownedByAWishedByB).toEqual([]);
        expect(result.ownedByBWishedByA).toEqual([]);
        expect(result.sharedWishlist).toEqual([]);
    });
    it("renvoie les jeux de A que B veut, triés par prix", async () => {
        const providers = makeFakeProviders({
            libraries: {
                A: [makeGame(2, "Celeste"), makeGame(4, "Among Us"), makeGame(6, "Deep Rock Galactic")],
                B: [makeGame(3, "Portal 2")],
            },
            wishlists: {
                A: [],
                B: ["6", "2", "4"],
            },
            details: [
                makeGameDetails({ id: "2", name: "Celeste", isMultiplayer: false }),
                makeGameDetails({ id: "4", name: "Among Us", isMultiplayer: true, price: { kind: "free" } }),
                makeGameDetails({ id: "6", name: "Deep Rock Galactic", isMultiplayer: true,
                    price: { kind: "paid", finalCents: 599, initialCents: 2399, discountPercent: 75 } }),
            ],
        });

        const result = await findGamesToPlay("A", "B", providers);
        expect(result.ownedByAWishedByB.map(game => game.id)).toEqual(["4", "6"]);
    });
    it("renvoie les jeux de B que A veut, triés par prix", async () => {
        const providers = makeFakeProviders({
            libraries: {
                A: [makeGame(3, "Portal 2")],
                B: [makeGame(2, "Celeste"), makeGame(4, "Among Us"), makeGame(6, "Deep Rock Galactic")],
            },
            wishlists: {
                A: ["6", "2", "4"],
                B: [],
            },
            details: [
                makeGameDetails({ id: "2", name: "Celeste", isMultiplayer: false }),
                makeGameDetails({ id: "4", name: "Among Us", isMultiplayer: true, price: { kind: "free" } }),
                makeGameDetails({ id: "6", name: "Deep Rock Galactic", isMultiplayer: true,
                    price: { kind: "paid", finalCents: 599, initialCents: 2399, discountPercent: 75 } }),
            ],
        });

        const result = await findGamesToPlay("A", "B", providers);
        expect(result.ownedByBWishedByA.map(game => game.id)).toEqual(["4", "6"]);
    });
    it("renvoie la wishlist commune avec les détails, triée par prix", async () => {
        const providers = makeFakeProviders({
            libraries: {
                A: [],
                B: [],
            },
            wishlists: {
                A: ["6", "2", "4"],
                B: ["2", "6", "4"],
            },
            details: [
                makeGameDetails({ id: "2", name: "Celeste", isMultiplayer: false }),
                makeGameDetails({ id: "4", name: "Among Us", isMultiplayer: true, price: { kind: "free" } }),
                makeGameDetails({ id: "6", name: "Deep Rock Galactic", isMultiplayer: true,
                    price: { kind: "paid", finalCents: 599, initialCents: 2399, discountPercent: 75 } }),
            ],
        });

        const result = await findGamesToPlay("A", "B", providers);
        expect(result.sharedWishlist.map(game => game.id)).toEqual(["4", "6"]);
    });
    it("ignore les jeux dont les détails sont introuvables",async () => {
        const providers = makeFakeProviders({
            libraries: {
                A: [makeGame(1, "Skyrim"), makeGame(2, "Celeste")],
                B: [makeGame(1, "Skyrim"), makeGame(3, "Hollow knight")]
            },
            wishlists: {
                A: ["6", "4", "7"],
                B: ["6", "2", "7"],
            },
            details: [
                makeGameDetails({ id: "1", name:"Skyrim", isMultiplayer: false}),
                makeGameDetails({ id: "2", name: "Celeste", isMultiplayer: false }),
                makeGameDetails({ id: "3", name: "Hollow knight", isMultiplayer: false }),
                makeGameDetails({ id: "4", name: "Among Us", isMultiplayer: true, price: { kind: "free" } }),
                makeGameDetails({ id: "6", name: "Deep Rock Galactic", isMultiplayer: true,
                    price: { kind: "paid", finalCents: 599, initialCents: 2399, discountPercent: 75 } })
            ],
        });

        const result = await findGamesToPlay("A", "B", providers);
        expect(result.sharedWishlist.map(game => game.id)).toEqual(["6"]);
    });
    it("respecte le budget de détails en priorisant la wishlist commune", async () => {
        const providers = makeFakeProviders({
            libraries: {
                A: [makeGame(1, "Among Us"), makeGame(2, "Portal 2")],
                B: [makeGame(1, "Among Us"), makeGame(2, "Portal 2")],
            },
            wishlists: {
                A: ["9"],
                B: ["9"],
            },
            details: [
                makeGameDetails({ id: "1", name: "Among Us" }),
                makeGameDetails({ id: "2", name: "Portal 2" }),
                makeGameDetails({ id: "9", name: "Deep Rock Galactic" }),
            ],
        });

        const result = await findGamesToPlay("A", "B", providers, { maxDetailsLookups: 2 });

        expect(result.sharedWishlist.map(game => game.id)).toEqual(["9"]);   // priorité 1 : gardé
        expect(result.commonGames).toHaveLength(1);                         // un seul des deux jeux en commun analysé
        expect(result.skippedGamesCount).toBe(1);
    });

    it("indique zéro jeu ignoré quand le budget n'est pas limité", async () => {
        const providers = makeFakeProviders({
            libraries: { A: [makeGame(1, "Among Us")], B: [makeGame(1, "Among Us")] },
            wishlists: { A: [], B: [] },
            details: [makeGameDetails({ id: "1", name: "Among Us" })],
        });

        const result = await findGamesToPlay("A", "B", providers);

        expect(result.skippedGamesCount).toBe(0);
    });
});