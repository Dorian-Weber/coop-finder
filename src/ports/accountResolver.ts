// Transforme ce que l'utilisateur a tapé en identifiant de compte, ou undefined si introuvable
export interface AccountResolver {
    resolve(input: string): Promise<string | undefined>;
}