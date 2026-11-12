import type { Game } from "../domain/game";

// Fournit la bibliothèque de jeux d'un joueur
export interface LibraryProvider {
    getLibrary(playerId: string): Promise<Game[]>;
}