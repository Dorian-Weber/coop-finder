import type {GameDetails} from "./domain/gameDetails";
import {SteamLibraryProvider} from "./adapters/steam/steamLibraryProvider";
import {SteamWishlistProvider} from "./adapters/steam/steamWishlistProvider";
import {SteamGameDetailsProvider} from "./adapters/steam/steamGameDetailsProvider";
import {findGamesToPlay} from "./domain/findGamesToPlay";
import {formatPrice} from "./presentation/formatPrice";

// Point d'entrée « terminal » : compare deux comptes Steam sans passer par Discord.
// Usage : npm run dev src/compare.ts <steamIdA> <steamIdB>

const [idA, idB] = process.argv.slice(2);
if (!idA || !idB) {
    console.error("Usage : npm run dev src/compare.ts <steamIdA> <steamIdB>");
    process.exit(1);
}

const apiKey = process.env.STEAM_API_KEY;
if (!apiKey) {
    throw new Error("STEAM_API_KEY manquant dans le fichier .env");
}

// Brancher les fournisseurs Steam sur le service
const providers = {
    library: new SteamLibraryProvider(apiKey),
    wishlist: new SteamWishlistProvider(),
    details: new SteamGameDetailsProvider(),
};

const report = await findGamesToPlay(idA, idB, providers);

// Affichage dans le terminal (le bot Discord a son propre formateur)
function printGames(title: string, games: GameDetails[], showPrice: boolean): void {
    console.log(`\n${title} (${games.length}) :`);
    for (const game of games) {
        let line = `- ${game.name}`;
        if (showPrice) {
            line += ` — ${formatPrice(game.price)}`;
        }
        if (game.status === "early_access") {
            line += " · Accès anticipé";
        }
        console.log(line);
    }
}

printGames("🎮 Jeux multi en commun", report.commonGames, false);
printGames("🎁 A possède des jeux de la wishlist de B", report.ownedByAWishedByB, true);
printGames("🎁 B possède des jeux de la wishlist de A", report.ownedByBWishedByA, true);
printGames("💸 Dans les deux wishlists", report.sharedWishlist, true);