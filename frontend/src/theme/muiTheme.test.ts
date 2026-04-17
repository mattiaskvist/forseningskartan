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

    it("exposes custom surface palette tokens", () => {
        const theme = createAppMuiTheme("Dark");
        expect(theme.palette.surface).toBeDefined();
        expect(theme.palette.surface.panelBg).toBeTruthy();
        expect(theme.palette.surface.panelBorder).toBeTruthy();
        expect(theme.palette.surface.panelTitle).toBeTruthy();
        expect(theme.palette.surface.navActiveBg).toBeTruthy();
        expect(theme.palette.surface.avatarBg).toBeTruthy();
    });

    it("provides correct palette colors for Dark style", () => {
        const theme = createAppMuiTheme("Dark");
        expect(theme.palette.background.default).toBe("#0f172a");
        expect(theme.palette.primary.main).toBe("#60a5fa");
    });

    it("provides correct palette colors for Classic style", () => {
        const theme = createAppMuiTheme("Classic");
        expect(theme.palette.background.default).toBe("#f7f0df");
        expect(theme.palette.surface.panelTitle).toBe("#3f2f1f");
    });

    it("provides reusable MUI component overrides", () => {
        const theme = createAppMuiTheme("Light");

        expect(theme.components?.MuiToggleButton?.styleOverrides).toBeDefined();
        expect(theme.components?.MuiToggleButtonGroup?.styleOverrides).toBeDefined();
        expect(theme.components?.MuiOutlinedInput?.styleOverrides).toBeDefined();
        expect(theme.components?.MuiPaginationItem?.styleOverrides).toBeDefined();
    });
});
