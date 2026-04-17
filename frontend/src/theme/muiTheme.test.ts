import { describe, expect, it } from "vitest";
import { createAppMuiTheme } from "./muiTheme";
import { getAppStyleThemeTokens } from "./appStyleTheme";

describe("createAppMuiTheme", () => {
    it("uses dark mode for Dark app style", () => {
        const theme = createAppMuiTheme("Dark");
        expect(theme.palette.mode).toBe("dark");
    });

    it("uses light mode for Light app style", () => {
        const theme = createAppMuiTheme("Light");
        expect(theme.palette.mode).toBe("light");
    });

    it("uses light mode for Classic app style", () => {
        const theme = createAppMuiTheme("Classic");
        expect(theme.palette.mode).toBe("light");
    });

    it("wires app style tokens into MUI palette", () => {
        const tokens = getAppStyleThemeTokens("Dark");
        const theme = createAppMuiTheme("Dark");

        expect(theme.palette.background.default).toBe(tokens.palette.backgroundDefault);
        expect(theme.palette.primary.main).toBe(tokens.palette.primaryMain);
    });

    it("provides reusable MUI component overrides", () => {
        const theme = createAppMuiTheme("Light");

        expect(theme.components?.MuiToggleButton?.styleOverrides).toBeDefined();
        expect(theme.components?.MuiToggleButtonGroup?.styleOverrides).toBeDefined();
        expect(theme.components?.MuiOutlinedInput?.styleOverrides).toBeDefined();
        expect(theme.components?.MuiPaginationItem?.styleOverrides).toBeDefined();
    });
});
