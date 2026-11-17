// La petite partie d'une interaction Discord dont on a besoin.
// La vraie contient bien plus de champs (auteur, salon, serveur…).
export interface CommandOption {
    name: string;
    value: string;
}

export interface Interaction {
    type: number;
    token: string;   // permet de modifier la réponse pendant 15 minutes
    data?: {
        name: string;
        options?: CommandOption[];
    };
}

// Lit la valeur d'une option de commande par son nom
export function getOption(interaction: Interaction, name: string): string | undefined {
    return interaction.data?.options?.find(option => option.name === name)?.value;
}
