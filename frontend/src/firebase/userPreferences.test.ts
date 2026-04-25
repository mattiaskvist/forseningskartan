import { describe, expect, it } from "vitest";
import { sanitizeUserPreferences } from "./userPreferences";

describe("sanitizeUserPreferences", () => {
    it("falls back to defaults for invalid input", () => {
        expect(sanitizeUserPreferences(null)).toEqual({
            favoriteSiteIds: [],
            recentSearchSiteIds: [],
            appStyle: "Dark",
            language: "en",
            mapTransportationModeFilter: null,
            hideStopsWithoutDepartures: true,
        });
    });

    it("keeps only integer site ids and preserves order", () => {
        const sanitized = sanitizeUserPreferences({
            favoriteSiteIds: [4, "8", 9.5, 4, 7, {}, 7],
            recentSearchSiteIds: [1, "2", 3.5, 1, 5, {}, 5],
            appStyle: "Dark",
        });

        expect(sanitized.favoriteSiteIds).toEqual([4, 4, 7, 7]);
        expect(sanitized.recentSearchSiteIds).toEqual([1, 1, 5, 5]);
        expect(sanitized.language).toBe("en");
        expect(sanitized.mapTransportationModeFilter).toBeNull();
        expect(sanitized.hideStopsWithoutDepartures).toBe(true);
    });

    it("falls back to default app style for invalid value", () => {
        const sanitized = sanitizeUserPreferences({
            favoriteSiteIds: [1, 2],
            recentSearchSiteIds: [1, 2],
            appStyle: "Neon",
        });

        expect(sanitized.appStyle).toBe("Dark");
        expect(sanitized.language).toBe("en");
        expect(sanitized.mapTransportationModeFilter).toBeNull();
    });

    it("sets appStyle correctly", () => {
        const sanitized = sanitizeUserPreferences({
            favoriteSiteIds: [1, 2],
            recentSearchSiteIds: [1, 2],
            appStyle: "Classic",
        });

        expect(sanitized.appStyle).toBe("Classic");
        expect(sanitized.language).toBe("en");
        expect(sanitized.hideStopsWithoutDepartures).toBe(true);
    });

    it("sets language correctly", () => {
        const sanitized = sanitizeUserPreferences({
            language: "sv",
        });

        expect(sanitized.language).toBe("sv");
    });

    it("sets map filters correctly", () => {
        const sanitized = sanitizeUserPreferences({
            mapTransportationModeFilter: "BUS",
            hideStopsWithoutDepartures: false,
        });

        expect(sanitized.mapTransportationModeFilter).toBe("BUS");
        expect(sanitized.hideStopsWithoutDepartures).toBe(false);
    });
});
