import { describe, it, expect } from "vitest";
import { InMemoryUserLinkRepository } from "../../../src/adapters/memory/inMemoryUserLinkRepository";

describe("InMemoryUserLinkRepository", () => {
    it("retrouve un SteamID enregistré", async () => {
        const repository = new InMemoryUserLinkRepository();

        await repository.link("discord-1", "76561198000000001");

        expect(await repository.getSteamId("discord-1")).toBe("76561198000000001");
    });

    it("renvoie undefined pour un utilisateur jamais lié", async () => {
        const repository = new InMemoryUserLinkRepository();

        expect(await repository.getSteamId("inconnu")).toBeUndefined();
    });

    it("remplace le SteamID si l'utilisateur se lie à nouveau", async () => {
        const repository = new InMemoryUserLinkRepository();

        await repository.link("discord-1", "76561198000000001");
        await repository.link("discord-1", "76561198000000002");

        expect(await repository.getSteamId("discord-1")).toBe("76561198000000002");
    });

    it("supprime le lien avec unlink", async () => {
        const repository = new InMemoryUserLinkRepository();
        await repository.link("discord-1", "76561198000000001");

        await repository.unlink("discord-1");

        expect(await repository.getSteamId("discord-1")).toBeUndefined();
    });

    it("ne touche pas aux liens des autres utilisateurs", async () => {
        const repository = new InMemoryUserLinkRepository();
        await repository.link("discord-1", "76561198000000001");
        await repository.link("discord-2", "76561198000000002");

        await repository.unlink("discord-1");

        expect(await repository.getSteamId("discord-2")).toBe("76561198000000002");
    });
});
