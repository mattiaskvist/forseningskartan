import { describe, expect, it } from "vitest";
import { normalizeText } from "./text";

describe("normalizeText", () => {
    it("removes accents and converts to lowercase", () => {
        const input = "Héllo Wörld!";
        const expectedOutput = "hello world!";
        expect(normalizeText(input)).toBe(expectedOutput);
    });

    it("removes accents from stop name", () => {
        const input = "Fruängen";
        const expectedOutput = "fruangen";
        expect(normalizeText(input)).toBe(expectedOutput);
    });

    it("handles empty string", () => {
        expect(normalizeText("")).toBe("");
    });

    it("handles string without accents", () => {
        const input = "Just a normal string.";
        expect(normalizeText(input)).toBe(input.toLowerCase());
    });
});
