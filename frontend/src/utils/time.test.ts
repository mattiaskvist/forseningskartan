import { describe, expect, it } from "vitest";
import {
    formatDelay,
    formatTime,
    getAvgDelayMinutes,
    getAvgDelaySeconds,
    getDelayMinutes,
    sortDatesDescendingCB,
} from "./time";
import { Departure } from "../types/sl";
import { DelaySummary } from "../types/historicalDelay";

describe("formatTime", () => {
    it("returns '-' for undefined", () => {
        expect(formatTime(undefined)).toBe("-");
    });

    it("returns '-' for invalid date string", () => {
        expect(formatTime("not-a-date")).toBe("-");
    });

    it("formats a valid timestamp as HH:mm in sv-SE locale", () => {
        const input = "2024-01-01T09:05:00Z";
        const expected = new Date(input).toLocaleTimeString("sv-SE", {
            hour: "2-digit",
            minute: "2-digit",
        });

        expect(formatTime(input)).toBe(expected);
    });
});

describe("formatDelay", () => {
    it("returns delay unavailable for null", () => {
        expect(formatDelay(null)).toBe("delay unavailable");
    });

    it("returns On time for zero", () => {
        expect(formatDelay(0)).toBe("On time");
    });

    it("returns Ahead by for negative delay", () => {
        expect(formatDelay(-3)).toBe("Ahead by 3 min");
    });

    it("returns Late by for positive delay", () => {
        expect(formatDelay(7)).toBe("Late by 7 min");
    });
});

const baseDeparture: Departure = {
    direction: "North",
    direction_code: 1,
    state: "EXPECTED",
    scheduled: "2024-01-01T10:00:00Z",
    display: "10:00",
    journey: {
        id: 123,
        state: "EXPECTED",
    },
    stop_area: {
        id: 1,
        name: "Central",
    },
    stop_point: {
        id: 10,
        name: "A",
    },
    line: {
        id: 100,
    },
};

describe("getDelayMinutes", () => {
    it("returns 0 when expected time is missing", () => {
        const departure: Departure = {
            ...baseDeparture,
            expected: undefined,
        };

        expect(getDelayMinutes(departure)).toBe(0);
    });

    it("returns null when expected timestamp is invalid", () => {
        const departure: Departure = {
            ...baseDeparture,
            expected: "invalid-date",
        };

        expect(getDelayMinutes(departure)).toBeNull();
    });

    it("returns null when scheduled timestamp is invalid", () => {
        const departure: Departure = {
            ...baseDeparture,
            scheduled: "invalid-date",
            expected: "2024-01-01T10:05:00Z",
        };

        expect(getDelayMinutes(departure)).toBeNull();
    });

    it("returns rounded delay minutes when both timestamps are valid", () => {
        const departure: Departure = {
            ...baseDeparture,
            scheduled: "2024-01-01T10:00:00Z",
            expected: "2024-01-01T10:04:31Z",
        };

        expect(getDelayMinutes(departure)).toBe(5);
    });
});

describe("getAvgDelaySeconds", () => {
    it("returns departure delay stats average seconds", () => {
        const summary: DelaySummary = {
            departureDelayStats: { avgSeconds: 120 },
            arrivalDelayStats: { avgSeconds: 90 },
        } as DelaySummary;

        expect(getAvgDelaySeconds(summary, "departure")).toBe(120);
    });

    it("returns arrival delay stats average seconds", () => {
        const summary: DelaySummary = {
            departureDelayStats: { avgSeconds: 120 },
            arrivalDelayStats: { avgSeconds: 90 },
        } as DelaySummary;

        expect(getAvgDelaySeconds(summary, "arrival")).toBe(90);
    });
});

describe("getAvgDelayMinutes", () => {
    it("converts average delay seconds to minutes", () => {
        const summary: DelaySummary = {
            departureDelayStats: { avgSeconds: 300 },
            arrivalDelayStats: { avgSeconds: 0 },
        } as DelaySummary;

        expect(getAvgDelayMinutes(summary, "departure")).toBe(5);
    });

    it("rounds to one decimal place", () => {
        const summary: DelaySummary = {
            departureDelayStats: { avgSeconds: 250 },
            arrivalDelayStats: { avgSeconds: 0 },
        } as DelaySummary;

        expect(getAvgDelayMinutes(summary, "departure")).toBe(4.2);
    });
});

describe("sortDatesDescendingCB", () => {
    it("sorts dates in descending order", () => {
        const dates = ["2024-01-01", "2024-01-15", "2024-01-05"];
        const sorted = dates.sort(sortDatesDescendingCB);

        expect(sorted).toEqual(["2024-01-15", "2024-01-05", "2024-01-01"]);
    });
});
