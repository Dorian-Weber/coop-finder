// Fournit la wishlist de jeux d'un joueur
export interface WishlistProvider {
    getWishlist(playerId: string): Promise<string[]>;
}