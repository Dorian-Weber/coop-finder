import type { PlayTogetherReport } from "../domain/findGamesToPlay";
import type { GameDetails } from "../domain/gameDetails";
import { formatPrice } from "../presentation/formatPrice";
import { FREE_ONLINE_GAMES } from "../presentation/freeOnlineGame";

// Au-delà, les jeux sont masqués : un message Discord est limité à 2 000 caractères
const MAX_GAMES_PER_SECTION = 10;

// Transforme le rapport en message Discord (markdown Discord)
export function formatReport(report: PlayTogetherReport, playerA: string, playerB: string): string {
    const sections = [
        formatSection("🎮", "Jeux multi en commun", report.commonGames, false),
        formatSection("🎁", `${playerA} possède des jeux de la wishlist ${deOrD(playerB)}`, report.ownedByAWishedByB, true),
        formatSection("🎁", `${playerB} possède des jeux de la wishlist ${deOrD(playerA)}`, report.ownedByBWishedByA, true),
        formatSection("💸", "Dans vos deux wishlists", report.sharedWishlist, true),
        formatFreeOnlineGames(),
    ];
    return sections.join("\n\n");
}

// Un titre, puis une ligne par jeu (ou « Aucun jeu »), puis le nombre de jeux masqués
function formatSection(emoji: string, title: string, games: GameDetails[], showPrice: boolean): string {
    const lines = [`${emoji} **${title}** (${games.length})`];

    if (games.length === 0) {
        lines.push("Aucun jeu");
        return lines.join("\n");
    }

    for (const game of games.slice(0, MAX_GAMES_PER_SECTION)) {
        lines.push(formatGameLine(game, showPrice));
    }

    const hiddenCount = games.length - MAX_GAMES_PER_SECTION;
    if (hiddenCount > 0) {
        lines.push(`… et ${hiddenCount} ${hiddenCount > 1 ? "autres" : "autre"}`);
    }

    return lines.join("\n");
}

function formatGameLine(game: GameDetails, showPrice: boolean): string {
    let line = `• ${game.name}`;
    if (showPrice) {
        line += ` — ${formatGamePrice(game)}`;
    }
    if (game.status === "early_access") {
        line += " · Accès anticipé";
    }
    return line;
}

// Un jeu sans prix qui n'est pas encore sorti : on le dit plutôt que « prix indisponible »
function formatGamePrice(game: GameDetails): string {
    if (game.price.kind === "unknown" && game.status === "coming_soon") {
        return "Pas encore sorti";
    }
    return formatPrice(game.price);
}

function formatFreeOnlineGames(): string {
    const lines = ["🌐 **Et sinon, gratuit dans le navigateur :**"];
    for (const game of FREE_ONLINE_GAMES) {
        // Les chevrons empêchent Discord d'afficher un grand aperçu sous chaque lien
        lines.push(`• ${game.name} — <${game.url}>`);
    }
    return lines.join("\n");
}

// « de Bob » mais « d'Alice » : élision devant une voyelle, accents compris (« d'Émile »)
function deOrD(name: string): string {
    const firstLetter = name.normalize("NFD").charAt(0).toLowerCase();
    return "aeiou".includes(firstLetter) && firstLetter !== "" ? `d'${name}` : `de ${name}`;
}
