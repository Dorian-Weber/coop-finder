// Enregistre les commandes slash sur le serveur de test.
// Usage : npm run register
import { ALL_COMMANDS } from "../src/discord/commands";

const { DISCORD_APPLICATION_ID, DISCORD_TOKEN, DISCORD_GUILD_ID } = process.env;

if (!DISCORD_APPLICATION_ID || !DISCORD_TOKEN || !DISCORD_GUILD_ID) {
    throw new Error("DISCORD_APPLICATION_ID, DISCORD_TOKEN et DISCORD_GUILD_ID doivent être définis dans .dev.vars");
}

// Commandes de serveur : visibles instantanément, uniquement sur ce serveur
const url = `https://discord.com/api/v10/applications/${DISCORD_APPLICATION_ID}/guilds/${DISCORD_GUILD_ID}/commands`;

// PUT remplace toutes les commandes du serveur par cette liste
const response = await fetch(url, {
    method: "PUT",
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bot ${DISCORD_TOKEN}`,
    },
    body: JSON.stringify(ALL_COMMANDS),
});

if (!response.ok) {
    throw new Error(`Échec de l'enregistrement : ${response.status} ${await response.text()}`);
}

console.log(`${ALL_COMMANDS.length} commande(s) enregistrée(s) sur le serveur de test.`);
