import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppStyleSelector } from "./AppStyleSelector";
import { renderWithTheme } from "../test/renderWithTheme";
import { translations } from "../utils/translations";

describe("AppStyleSelector", () => {
    it("uses MUI toggle state and emits style changes", () => {
        const setAppStyle = vi.fn();
        renderWithTheme(
            <AppStyleSelector
                appStyle="Dark"
                setAppStyle={setAppStyle}
                t={translations.en.appStyleSelector}
            />
        );

        const activeButton = screen.getByRole("button", { name: "Dark" });
        const inactiveButton = screen.getByRole("button", { name: "Light" });

        expect(activeButton).toHaveAttribute("aria-pressed", "true");
        expect(inactiveButton).toHaveAttribute("aria-pressed", "false");

        fireEvent.click(inactiveButton);
        expect(setAppStyle).toHaveBeenCalledWith("Light");
    });
});
