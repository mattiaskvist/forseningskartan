import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RouteDelayControls } from "./RouteDelayControls";
import { renderWithTheme } from "../test/renderWithTheme";
import { translations } from "../utils/translations";

describe("RouteDelayControls", () => {
    it("renders transportation mode labels in title case", () => {
        renderWithTheme(
            <RouteDelayControls
                selectedSection="routes"
                isRouteDetailsOpen={false}
                availableDates={[]}
                selectedDatePreset="last7Days"
                selectedCustomDate={null}
                selectedEventType="departure"
                selectedTransportationMode="BUS"
                searchQuery=""
                transportationModeOptions={["BUS", "TRAIN"]}
                onDatePresetChange={vi.fn()}
                onCustomDateChange={vi.fn()}
                onEventTypeChange={vi.fn()}
                onTransportationModeChange={vi.fn()}
                onSearchQueryChange={vi.fn()}
                t={translations.en.routeDelayControls}
                tDatePicker={translations.en.availableDatesPicker}
                tTransportModes={translations.en.transportModes}
            />
        );

        expect(screen.getByRole("button", { name: "Bus" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Train" })).toBeInTheDocument();
    });
});
