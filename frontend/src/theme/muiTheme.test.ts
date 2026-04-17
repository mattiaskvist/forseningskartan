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
});
