import { describe, it, expect } from "vitest";
import { formatGroupReport } from "../../src/discord/formatGroupReport";
import { formatPrice } from "../../src/presentation/formatPrice";
import { makeGameDetails } from "../helpers/makeGameDetails";
import type { GroupReport } from "../../src/domain/findGamesForGroup";

const emptyReport: GroupReport = { playableByAll: [], missingOne: [], wishedByMany: [] };
const labels = { A: "Alice", B: "Bob", C: "Chloé" };

describe("formatGroupReport", () => {
    it("affiche les trois sections avec leur nombre de jeux", () => {
        const message = formatGroupReport(emptyReport, labels);

        expect(message).toContain("**Jouable par tout le monde** (0)");
        expect(message).toContain("**Il ne manque qu'une personne** (0)");
        expect(message).toContain("**Envies communes** (0)");
        expect(message).toContain("Aucun jeu");
    });

    it("indique qui manque et le prix pour les jeux à une personne près", () => {
        const game = makeGameDetails({ id: "4", name: "Valheim" });
        const message = formatGroupReport({ ...emptyReport, missingOne: [{ game, missingPlayerId: "C" }] }, labels);

        expect(message).toContain(`• Valheim — manque Chloé — ${formatPrice(game.price)}`);
    });

    it("indique le nombre d'intéressés pour les envies communes", () => {
        const game = makeGameDetails({ id: "9", name: "Lethal Company" });
        const message = formatGroupReport({ ...emptyReport, wishedByMany: [{ game, interestedPlayerIds: ["A", "B", "C"] }] }, labels);

        expect(message).toContain("• Lethal Company — 3 intéressés");
    });

    it("signale les jeux non vérifiés et termine par les jeux gratuits", () => {
        const message = formatGroupReport(emptyReport, labels, 4);

        expect(message).toContain("⏳ 4 jeu(x)");
        expect(message).toContain("<https://codenames.game>");
    });
});
