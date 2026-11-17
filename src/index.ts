import { verifyKey, InteractionType, InteractionResponseType } from "discord-interactions";
import { getOption, type Interaction } from "./discord/interaction";
import { JOUER_COMMAND } from "./discord/commands";
import { handleJouer } from "./discord/handleJouer";

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

        // 4. La commande /jouer
        if (interaction.type === InteractionType.APPLICATION_COMMAND && interaction.data?.name === JOUER_COMMAND.name) {
            const steamIdA = getOption(interaction, "steam_a");
            const steamIdB = getOption(interaction, "steam_b");

            if (!steamIdA || !steamIdB) {
                return Response.json({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: { content: "Il faut indiquer deux SteamID." },
                });
            }

            // Le travail continue en arrière-plan après la réponse
            ctx.waitUntil(handleJouer({ steamIdA, steamIdB, interactionToken: interaction.token }, env));

            // Réponse immédiate : Discord affiche « réfléchit… »
            return Response.json({ type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE });
        }

        return new Response("Interaction non gérée", { status: 400 });
    },
};