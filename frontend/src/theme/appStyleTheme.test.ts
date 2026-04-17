import { describe, expect, it } from "vitest";
import { appStyles } from "../types/appStyle";
import { getAppStyleCssVariables, getAppStyleThemeTokens } from "./appStyleTheme";

describe("appStyleTheme tokens", () => {
    it("exposes palette tokens for every app style", () => {
        for (const appStyle of appStyles) {
            const tokens = getAppStyleThemeTokens(appStyle);
            expect(tokens.palette.primaryMain).toBeTruthy();
            expect(tokens.palette.backgroundDefault).toBeTruthy();
        }
    });

    it("maps surface tokens to css variables", () => {
        const cssVariables = getAppStyleCssVariables("Classic");
        expect(cssVariables["--app-bg"]).toBe("#f7f0df");
        expect(cssVariables["--panel-title"]).toBe("#3f2f1f");
        expect(cssVariables["--button-primary-bg"]).toBe("#8b5e3b");
    });
});
