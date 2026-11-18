// Remplace le message « réfléchit… » par le vrai contenu.
// Le token d'interaction (fourni par Discord avec chaque commande) reste valable 15 minutes.
export async function editOriginalResponse(applicationId: string, interactionToken: string, content: string): Promise<void> {
    const url = `https://discord.com/api/v10/webhooks/${applicationId}/${interactionToken}/messages/@original`;

    const response = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        // allowed_mentions vide : les mentions s'affichent, mais ne notifient personne
        body: JSON.stringify({ content, allowed_mentions: { parse: [] } }),
    });

    if (!response.ok) {
        throw new Error(`Échec de la modification du message : ${response.status} ${await response.text()}`);
    }
}
