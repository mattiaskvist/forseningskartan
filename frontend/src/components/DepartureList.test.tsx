import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DepartureList } from "./DepartureList";
import { Departure } from "../types/sl";

const departureFixture: Departure = {
    direction: "Centralen",
    direction_code: 1,
    destination: "Centralen",
    state: "EXPECTED",
    scheduled: "2026-04-17T12:00:00Z",
    expected: "2026-04-17T12:02:00Z",
    display: "12:00",
    journey: {
        id: 1001,
        state: "EXPECTED",
    },
    stop_area: {
        id: 5320,
        name: "Stockholm Odenplan",
    },
    stop_point: {
        id: 2001,
        designation: "A",
    },
    line: {
        id: 4,
        designation: "4",
        transport_mode: "BUS",
    },
};

describe("DepartureList", () => {
    it("uses app-style hover class for departure rows", () => {
        render(<DepartureList departures={[departureFixture]} onSelectDeparture={vi.fn()} />);

        const departureRow = screen.getByRole("button", { name: /BUS 4 to Centralen/i });
        expect(departureRow).toHaveClass("themed-hover-surface");
    });

    it("uses app-style surface class for transport mode header", () => {
        render(<DepartureList departures={[departureFixture]} onSelectDeparture={vi.fn()} />);
        const modeLabels = screen.getAllByText("BUS");
        const headerLabel = modeLabels.find((element) => element.className.includes("text-xs"));
        expect(headerLabel).toBeDefined();
        expect(headerLabel).toHaveClass("themed-surface-subtle");
    });
});
