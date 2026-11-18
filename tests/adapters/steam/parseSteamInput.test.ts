import { describe, it, expect } from "vitest";
import { parseSteamInput } from "../../../src/adapters/steam/parseSteamInput";

const STEAM_ID = "76561198012345678";

describe("parseSteamInput", () => {
    it("reconnaît un SteamID64", () => {
        expect(parseSteamInput(STEAM_ID)).toEqual({ kind: "steamId", steamId: STEAM_ID });
    });

    it("extrait le SteamID64 d'une URL de profil numérique", () => {
        expect(parseSteamInput(`https://steamcommunity.com/profiles/${STEAM_ID}/`))
            .toEqual({ kind: "steamId", steamId: STEAM_ID });
    });

    it("extrait le pseudo d'une URL de profil personnalisée", () => {
        expect(parseSteamInput("https://steamcommunity.com/id/nairow/"))
            .toEqual({ kind: "vanity", vanityName: "nairow" });
    });

    it("reconnaît un pseudo d'URL seul", () => {
        expect(parseSteamInput("nairow")).toEqual({ kind: "vanity", vanityName: "nairow" });
    });

    it("ignore les espaces autour du texte", () => {
        expect(parseSteamInput(`  ${STEAM_ID}  `)).toEqual({ kind: "steamId", steamId: STEAM_ID });
    });

    it("refuse un texte vide", () => {
        expect(parseSteamInput("   ")).toEqual({ kind: "invalid" });
    });

    it("refuse un texte qui ne peut pas être un pseudo Steam", () => {
        expect(parseSteamInput("mon pseudo avec des espaces")).toEqual({ kind: "invalid" });
    });

    it("refuse une URL d'un autre site", () => {
        expect(parseSteamInput("https://example.com/id/nairow")).toEqual({ kind: "invalid" });
    });
});
