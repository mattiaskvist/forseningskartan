import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MapStyleSelector } from "./MapStyleSelector";

describe("MapStyleSelector", () => {
    it("uses MUI toggle state and emits style changes", () => {
        const setAppStyle = vi.fn();
        render(<MapStyleSelector appStyle="Dark" setAppStyle={setAppStyle} />);

        const activeButton = screen.getByRole("button", { name: "Dark" });
        const inactiveButton = screen.getByRole("button", { name: "Light" });

        expect(activeButton).toHaveAttribute("aria-pressed", "true");
        expect(inactiveButton).toHaveAttribute("aria-pressed", "false");

        fireEvent.click(inactiveButton);
        expect(setAppStyle).toHaveBeenCalledWith("Light");
    });
});
