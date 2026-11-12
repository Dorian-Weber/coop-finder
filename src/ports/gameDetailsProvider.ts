import type {GameDetails} from "../domain/gameDetails";

// Fournit les détails d'un jeu
export interface GameDetailsProvider {
    getGameDetails(gameId: string): Promise<GameDetails | undefined> ;
}