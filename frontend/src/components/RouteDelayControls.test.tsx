import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RouteDelayControls } from "./RouteDelayControls";
import { renderWithTheme } from "../test/renderWithTheme";
import { translations } from "../utils/translations";

describe("RouteDelayControls", () => {
    const noop = () => {}; // no need for vi.fn() unless we mock things or inspect returns

    it("renders transportation mode labels in title case", () => {
        renderWithTheme(
            <RouteDelayControls
                selectedSection="routes"
                isRouteDetailsOpen={false}
                availableDates={[]}
                selectedDatePreset="last7Days"
                selectedCustomDateRange={null}
                selectedEventType="departure"
                selectedTransportationMode="BUS"
                searchQuery=""
                transportationModeOptions={["BUS", "TRAIN"]}
                onDatePresetChange={noop}
                onCustomDateRangeChange={noop}
                onEventTypeChange={noop}
                onTransportationModeChange={noop}
                onSearchQueryChange={noop}
                t={translations.en.routeDelayControls}
                tDatePicker={translations.en.availableDatesPicker}
                tTransportModes={translations.en.transportModes}
            />
        );

        expect(screen.getByRole("button", { name: "Bus" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Train" })).toBeInTheDocument();
    });

    it("renders from and to date pickers for the custom date range preset", () => {
        renderWithTheme(
            <RouteDelayControls
                selectedSection="routes"
                isRouteDetailsOpen={false}
                availableDates={["2024-01-01", "2024-01-02"]}
                selectedDatePreset="customDate"
                selectedCustomDateRange={null}
                selectedEventType="departure"
                selectedTransportationMode="BUS"
                searchQuery=""
                transportationModeOptions={["BUS"]}
                onDatePresetChange={noop}
                onCustomDateRangeChange={noop}
                onEventTypeChange={noop}
                onTransportationModeChange={noop}
                onSearchQueryChange={noop}
                t={translations.en.routeDelayControls}
                tDatePicker={translations.en.availableDatesPicker}
                tTransportModes={translations.en.transportModes}
            />
        );

        expect(
            screen.getAllByText(translations.en.availableDatesPicker.startDate).length
        ).toBeGreaterThan(0);
        expect(
            screen.getAllByText(translations.en.availableDatesPicker.endDate).length
        ).toBeGreaterThan(0);
    });
});
