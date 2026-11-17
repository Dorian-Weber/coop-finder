import { verifyKey, InteractionType, InteractionResponseType } from "discord-interactions";

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
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
        const interaction = JSON.parse(body);

        // 3. Répondre au PING de Discord
        if (interaction.type === InteractionType.PING) {
            return Response.json({ type: InteractionResponseType.PONG });
        }

        return new Response("Interaction non gérée", { status: 400 });
    },
};