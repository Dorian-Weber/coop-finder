import { verifyKey, InteractionType, InteractionResponseType, InteractionResponseFlags } from "discord-interactions";
import { getOption, getUserId, type Interaction } from "./discord/interaction";
import { JOUER_COMMAND, LIER_COMMAND, DELIER_COMMAND } from "./discord/commands";
import { handleJouer } from "./discord/handleJouer";
import { handleLier } from "./discord/handleLier";
import { handleDelier } from "./discord/handleDelier";
import { D1UserLinkRepository } from "./adapters/d1/d1UserLinkRepository";

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        // Discord n'envoie que des POST
        if (request.method !== "POST") {
            return new Response("Méthode non autorisée", { status: 405 });
        }

        // 1. Vérifier que la requête vient bien de Discord
        const signature = request.headers.get("X-Signature-Ed25519");
        const timestamp = request.headers.get("X-Signature-Timestamp");
        const body = await request.text();

        const isValid = signature !== null && timestamp !== null
            && await verifyKey(body, signature, timestamp, env.DISCORD_PUBLIC_KEY);

        if (!isValid) {
            return new Response("Signature invalide", { status: 401 });
        }

        // 2. Lire l'interaction
        const interaction = JSON.parse(body) as Interaction;

        // 3. Répondre au PING de Discord
        if (interaction.type === InteractionType.PING) {
            return Response.json({ type: InteractionResponseType.PONG });
        }

        // 4. La commande /jouer @joueur
        if (interaction.type === InteractionType.APPLICATION_COMMAND && interaction.data?.name === JOUER_COMMAND.name) {
            const authorId = getUserId(interaction);
            const friendId = getOption(interaction, "joueur");
            if (!authorId || !friendId) {
                return ephemeralMessage("Il faut mentionner la personne avec qui tu veux jouer.");
            }
            if (authorId === friendId) {
                return ephemeralMessage("Mentionne quelqu'un d'autre que toi pour trouver à quoi jouer ensemble.");
            }

            const repository = new D1UserLinkRepository(env.DB);
            const [authorSteamId, friendSteamId] = await Promise.all([
                repository.getSteamId(authorId),
                repository.getSteamId(friendId),
            ]);

            if (!authorSteamId) {
                return ephemeralMessage("Tu n'as pas encore lié ton compte Steam : utilise d'abord `/lier`.");
            }
            if (!friendSteamId) {
                return ephemeralMessage(`<@${friendId}> n'a pas encore lié son compte Steam : il doit d'abord utiliser \`/lier\`.`);
            }

            // Le travail continue en arrière-plan après la réponse
            ctx.waitUntil(handleJouer({
                steamIdA: authorSteamId,
                steamIdB: friendSteamId,
                labelA: `<@${authorId}>`,
                labelB: `<@${friendId}>`,
                interactionToken: interaction.token,
            }, env));

            // Réponse immédiate : Discord affiche « réfléchit… »
            return Response.json({ type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE });
        }

        // 5. Les commandes /lier et /delier : réponses visibles uniquement par l'auteur (« éphémères »)
        if (interaction.type === InteractionType.APPLICATION_COMMAND) {
            const discordUserId = getUserId(interaction);
            if (!discordUserId) {
                return new Response("Utilisateur introuvable", { status: 400 });
            }

            if (interaction.data?.name === LIER_COMMAND.name) {
                const input = getOption(interaction, "compte") ?? "";
                ctx.waitUntil(handleLier({ discordUserId, input, interactionToken: interaction.token }, env));
                return Response.json({
                    type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
                    data: { flags: InteractionResponseFlags.EPHEMERAL },
                });
            }

            if (interaction.data?.name === DELIER_COMMAND.name) {
                const content = await handleDelier(discordUserId, env);
                return Response.json({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: { content, flags: InteractionResponseFlags.EPHEMERAL },
                });
            }
        }

        return new Response("Interaction non gérée", { status: 400 });
    },
};

// Réponse immédiate visible uniquement par l'auteur de la commande
function ephemeralMessage(content: string): Response {
    return Response.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content, flags: InteractionResponseFlags.EPHEMERAL },
    });
}
