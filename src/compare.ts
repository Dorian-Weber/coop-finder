import type {GameDetails, Price} from "./domain/gameDetails";
import {SteamLibraryProvider} from "./adapters/steam/steamLibraryProvider";
import {SteamWishlistProvider} from "./adapters/steam/steamWishlistProvider";
import {SteamGameDetailsProvider} from "./adapters/steam/steamGameDetailsProvider";
import {findGamesToPlay} from "./domain/findGamesToPlay";

// récupérer les deux SteamID passés en ligne de commande
const [idA, idB] = process.argv.slice(2);

// s'il en manque un, afficher comment utiliser le script et s'arrêter
if (!idA || !idB ) {
    throw new Error("Il manque un id")
}

// Brancher les fournisseurs Steam sur le service
const providers = {
    library: new SteamLibraryProvider(),
    wishlist: new SteamWishlistProvider(),
    details: new SteamGameDetailsProvider(),
};

const report = await findGamesToPlay(idA, idB, providers);

const euros = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

function formatPrice(price: Price): string {
    switch (price.kind) {
        case "free":
            return "gratuit";
        case "paid": {
            const amount = euros.format(price.finalCents / 100);
            return price.discountPercent > 0
                ? `${amount} (-${price.discountPercent} %)`
                : amount;
        }
        case "unknown":
            return "Non référencé";
    }
}


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