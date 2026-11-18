import { D1UserLinkRepository } from "../adapters/d1/d1UserLinkRepository";

// Rapide (une seule requête D1) : on répond directement, sans réponse différée
export async function handleDelier(discordUserId: string, env: Env): Promise<string> {
    const repository = new D1UserLinkRepository(env.DB);
    await repository.unlink(discordUserId);
    return "🗑️ L'association avec ton compte Steam a été supprimée.";
}
