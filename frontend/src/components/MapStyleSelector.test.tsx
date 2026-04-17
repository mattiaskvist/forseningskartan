import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MapStyleSelector } from "./MapStyleSelector";

describe("MapStyleSelector", () => {
    it("uses themed sidebar selector button classes", () => {
        render(<MapStyleSelector appStyle="Dark" setAppStyle={vi.fn()} />);

        const activeButton = screen.getByRole("button", { name: "Dark" });
        const inactiveButton = screen.getByRole("button", { name: "Light" });

        expect(activeButton).toHaveClass("style-selector-button");
        expect(activeButton).toHaveClass("style-selector-button-active");
        expect(inactiveButton).toHaveClass("style-selector-button");
    });
});
