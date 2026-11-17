import { describe, it, expect } from "vitest";
import { formatReport } from "../../src/discord/formatReport";
import { formatPrice } from "../../src/presentation/formatPrice";
import { makeGameDetails } from "../helpers/makeGameDetails";
import type { PlayTogetherReport } from "../../src/domain/findGamesToPlay";
import type { Price } from "../../src/domain/gameDetails";

// Rapport vide de référence : chaque test ne remplit que la section qui l'intéresse
const emptyReport: PlayTogetherReport = {
    commonGames: [],
    ownedByAWishedByB: [],
    ownedByBWishedByA: [],
    sharedWishlist: [],
};

const DEEP_ROCK_PRICE: Price = { kind: "paid", finalCents: 599, initialCents: 2399, discountPercent: 75 };

describe("formatReport", () => {
    it("affiche les quatre sections avec leur titre et leur nombre de jeux", () => {
        const report: PlayTogetherReport = {
            ...emptyReport,
            commonGames: [
                makeGameDetails({ id: "1", name: "Among Us" }),
                makeGameDetails({ id: "2", name: "Portal 2" }),
            ],
        };

        const message = formatReport(report, "Alice", "Bob");

        expect(message).toContain("**Jeux multi en commun** (2)");
        expect(message).toContain("**Alice possède des jeux de la wishlist de Bob** (0)");
        expect(message).toContain("**Bob possède des jeux de la wishlist d'Alice** (0)");
        expect(message).toContain("**Dans vos deux wishlists** (0)");
    });

    it("liste les jeux de chaque section avec une puce", () => {
        const report: PlayTogetherReport = {
            ...emptyReport,
            commonGames: [makeGameDetails({ id: "1", name: "Among Us" })],
        };

        const message = formatReport(report, "Alice", "Bob");

        expect(message).toContain("• Among Us");
    });

    it("affiche le prix des jeux sauf pour les jeux en commun", () => {
        const report: PlayTogetherReport = {
            ...emptyReport,
            commonGames: [makeGameDetails({ id: "1", name: "Among Us", price: DEEP_ROCK_PRICE })],
            sharedWishlist: [makeGameDetails({ id: "2", name: "Deep Rock Galactic", price: DEEP_ROCK_PRICE })],
        };

        const message = formatReport(report, "Alice", "Bob");

        // formatPrice sert de référence : le format des euros utilise des espaces spéciaux
        expect(message).toContain(`• Deep Rock Galactic — ${formatPrice(DEEP_ROCK_PRICE)}`);
        expect(message).not.toContain(`• Among Us — `);
    });

    it("signale les jeux en accès anticipé", () => {
        const report: PlayTogetherReport = {
            ...emptyReport,
            commonGames: [makeGameDetails({ id: "1", name: "Enshrouded", status: "early_access" })],
        };

        const message = formatReport(report, "Alice", "Bob");

        expect(message).toContain("• Enshrouded · Accès anticipé");
    });

    it("indique quand une section est vide", () => {
        const message = formatReport(emptyReport, "Alice", "Bob");

        expect(message).toContain("Aucun jeu");
    });

    it("limite chaque section à 10 jeux et indique combien sont masqués", () => {
        const games = Array.from({ length: 15 }, (_, i) =>
            makeGameDetails({ id: String(i + 1), name: `Jeu ${i + 1}` }),
        );
        const report: PlayTogetherReport = { ...emptyReport, commonGames: games };

        const message = formatReport(report, "Alice", "Bob");

        expect(message).toContain("**Jeux multi en commun** (15)");
        expect(message).toContain("• Jeu 10");
        expect(message).not.toContain("• Jeu 11");
        expect(message).toContain("… et 5 autres");
    });

    it("utilise « d' » devant un prénom qui commence par une voyelle", () => {
        const message = formatReport(emptyReport, "Bob", "Emma");

        expect(message).toContain("wishlist d'Emma");
        expect(message).toContain("wishlist de Bob");
    });

    it("termine par les jeux en ligne gratuits, avec des liens sans aperçu", () => {
        const message = formatReport(emptyReport, "Alice", "Bob");

        expect(message).toContain("• Codenames — <https://codenames.game>");
        expect(message.trimEnd().endsWith("<https://skribbl.io>")).toBe(true);
    });
});
