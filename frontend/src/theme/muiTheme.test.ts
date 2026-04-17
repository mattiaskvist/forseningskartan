import { describe, expect, it } from "vitest";
import { createAppMuiTheme } from "./muiTheme";

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

    it("provides correct palette colors for Dark style", () => {
        const theme = createAppMuiTheme("Dark");
        expect(theme.palette.background.default).toBe("#0f172a");
        expect(theme.palette.primary.main).toBe("#60a5fa");
        expect(theme.palette.divider).toBe("rgba(148, 163, 184, 0.45)");
    });

    it("provides correct palette colors for Classic style", () => {
        const theme = createAppMuiTheme("Classic");
        expect(theme.palette.background.default).toBe("#f7f0df");
        expect(theme.palette.text.primary).toBe("#3f2f1f");
    });

    it("provides MUI component overrides", () => {
        const theme = createAppMuiTheme("Light");
        expect(theme.components?.MuiToggleButton?.styleOverrides).toBeDefined();
        expect(theme.components?.MuiToggleButtonGroup?.styleOverrides).toBeDefined();
        expect(theme.components?.MuiOutlinedInput?.styleOverrides).toBeDefined();
        expect(theme.components?.MuiPaginationItem?.styleOverrides).toBeDefined();
    });
});
