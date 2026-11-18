-- Associe chaque utilisateur Discord à son compte Steam (commande /lier)
CREATE TABLE user_links (
    discord_user_id TEXT PRIMARY KEY,                  -- un seul compte Steam par utilisateur Discord
    steam_id        TEXT NOT NULL,                     -- SteamID64
    linked_at       TEXT NOT NULL DEFAULT (datetime('now'))
);
