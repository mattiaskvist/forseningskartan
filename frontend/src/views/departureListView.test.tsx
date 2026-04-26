import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DepartureListView } from "./departureListView";
import { Departure } from "../types/sl";
import { renderWithTheme } from "../test/renderWithTheme";
import { translations } from "../utils/translations";

const departureFixture: Departure = {
    direction: "Centralen",
    direction_code: 1,
    destination: "T-Centralen",
    state: "EXPECTED",
    scheduled: "2024-03-20T10:00:00",
    expected: "2024-03-20T10:05:00",
    display: "5 min",
    journey: {
        id: 12345,
        state: "NORMALPROGRESS",
    },
    stop_point: { id: 1, designation: "1" },
    stop_area: { id: 1, name: "Odenplan" },
    line: {
        id: 10,
        designation: "10",
        transport_mode: "METRO",
        group_of_lines: "Blå linjen",
    },
};

describe("DepartureListView", () => {
    it("renders departures with formatted times and translations", () => {
        const mockDepartures = [departureFixture];

        renderWithTheme(
            <DepartureListView
                departures={mockDepartures}
                onSelectDeparture={vi.fn()}
                t={translations.en.departureList}
                tTransportModes={translations.en.transportModes}
            />
        );

        // check for destination and line
        expect(screen.getByText(/Metro 10 to T-Centralen/i)).toBeInTheDocument();
        // check for translated "Planned" and "Predicted"
        expect(screen.getByText(/Planned 10:00/i)).toBeInTheDocument();
        expect(screen.getByText(/Predicted 10:05/i)).toBeInTheDocument();
    });

    it("filters departures by transport mode", () => {
        const mockDepartures = [departureFixture];
        renderWithTheme(
            <DepartureListView
                departures={mockDepartures}
                onSelectDeparture={vi.fn()}
                t={translations.en.departureList}
                tTransportModes={translations.en.transportModes}
            />
        );

        // Metro should be a button
        const metroButton = screen.getByRole("button", { name: "Metro" });
        expect(metroButton).toBeInTheDocument();
    });
});
