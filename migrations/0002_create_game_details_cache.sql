-- Cache des détails de jeux, pour ne pas redemander à Steam ce qu'on connaît déjà
CREATE TABLE game_details_cache (
    game_id      TEXT PRIMARY KEY,
    details_json TEXT NOT NULL,      -- un GameDetails sérialisé en JSON
    cached_at    INTEGER NOT NULL    -- date d'enregistrement, en millisecondes (Date.now())
);
