import { describe, expect, it } from "vitest";
import { sanitizeUserPreferences } from "./userPreferences";

describe("sanitizeUserPreferences", () => {
    it("falls back to defaults for invalid input", () => {
        expect(sanitizeUserPreferences(null)).toEqual({
            favoriteSiteIds: [],
            mapStyle: "Dark",
        });
    });

    it("keeps only integer site ids and preserves order", () => {
        const sanitized = sanitizeUserPreferences({
            favoriteSiteIds: [4, "8", 9.5, 4, 7, {}, 7],
            mapStyle: "Dark",
        });

        expect(sanitized.favoriteSiteIds).toEqual([4, 4, 7, 7]);
    });

    it("falls back to default map style for invalid value", () => {
        const sanitized = sanitizeUserPreferences({
            favoriteSiteIds: [1, 2],
            mapStyle: "Neon",
        });

        expect(sanitized.mapStyle).toBe("Dark");
    });
});
