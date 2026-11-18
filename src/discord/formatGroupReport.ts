import type { GroupReport } from "../domain/findGamesForGroup";
import { MAX_GAMES_PER_SECTION, formatGamePrice, formatFreeOnlineGames } from "./formatReport";

// Transforme le rapport de groupe en message Discord.
// labels : pour chaque identifiant de joueur, comment le désigner (mention Discord)
export function formatGroupReport(
    report: GroupReport,
    labels: Record<string, string>,
    skippedGamesCount = 0,
): string {
    const labelOf = (playerId: string) => labels[playerId] ?? "quelqu'un";

    const sections = [
        formatLines(
            "🎮", "Jouable par tout le monde", report.playableByAll.length,
            report.playableByAll.map(game => `• ${game.name}${earlyAccess(game.status)}`),
        ),
        formatLines(
            "🛒", "Il ne manque qu'une personne", report.missingOne.length,
            report.missingOne.map(({ game, missingPlayerId }) =>
                `• ${game.name} — manque ${labelOf(missingPlayerId)} — ${formatGamePrice(game)}${earlyAccess(game.status)}`),
        ),
        formatLines(
            "💸", "Envies communes", report.wishedByMany.length,
            report.wishedByMany.map(({ game, interestedPlayerIds }) =>
                `• ${game.name} — ${interestedPlayerIds.length} intéressés — ${formatGamePrice(game)}${earlyAccess(game.status)}`),
        ),
    ];
    if (skippedGamesCount > 0) {
        sections.push(`⏳ ${skippedGamesCount} jeu(x) n'ont pas encore pu être vérifiés auprès de Steam : relance la commande pour un résultat plus complet.`);
    }
    sections.push(formatFreeOnlineGames());
    return sections.join("\n\n");
}

// Un titre, puis les lignes (ou « Aucun jeu »), limitées à MAX_GAMES_PER_SECTION
function formatLines(emoji: string, title: string, total: number, lines: string[]): string {
    const output = [`${emoji} **${title}** (${total})`];
    if (lines.length === 0) {
        output.push("Aucun jeu");
        return output.join("\n");
    }
    output.push(...lines.slice(0, MAX_GAMES_PER_SECTION));
    const hiddenCount = lines.length - MAX_GAMES_PER_SECTION;
    if (hiddenCount > 0) {
        output.push(`… et ${hiddenCount} ${hiddenCount > 1 ? "autres" : "autre"}`);
    }
    return output.join("\n");
}

function earlyAccess(status: string): string {
    return status === "early_access" ? " · Accès anticipé" : "";
}
