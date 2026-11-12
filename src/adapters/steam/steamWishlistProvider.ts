import type {WishlistProvider} from "../../ports/wishlistProvider";
import {fetchWishlist} from "./fetchWishlist";

export class SteamWishlistProvider implements WishlistProvider {
    getWishlist(playerId: string): Promise<string[]> {
        return fetchWishlist(playerId);
    }
}