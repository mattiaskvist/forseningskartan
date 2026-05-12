import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../test/renderWithTheme";
import { AppIntroView } from "./appIntroView";

const appIntroViewProps = {
    isOpen: true,
    title: "Welcome to Förseningskartan",
    description:
        "Use live and historical delay data to understand what is happening now and what usually happens over time.",
    items: [
        {
            title: "Find a stop",
            description: "Search or filter the map to inspect Stockholm transit stops.",
        },
        {
            title: "Check live departures",
            description: "Open a stop to see upcoming departures and current delay predictions.",
        },
        {
            title: "Compare historical delays",
            description:
                "Select a departure to see how that line usually performs at similar times.",
        },
        {
            title: "Explore route delays",
            description: "Use Route Delays to compare routes, dates, transport modes, and trends.",
        },
    ],
    actionLabel: "Get started",
};

describe("AppIntroView", () => {
    it("renders the core workflow intro when open", () => {
        renderWithTheme(<AppIntroView {...appIntroViewProps} onClose={vi.fn()} />);

        expect(screen.getByText("Welcome to Förseningskartan")).toBeInTheDocument();
        expect(screen.getByText("Find a stop")).toBeInTheDocument();
        expect(screen.getByText("Check live departures")).toBeInTheDocument();
        expect(screen.getByText("Compare historical delays")).toBeInTheDocument();
        expect(screen.getByText("Explore route delays")).toBeInTheDocument();
    });

    it("calls onClose from the get started button", () => {
        const onClose = vi.fn();

        renderWithTheme(<AppIntroView {...appIntroViewProps} onClose={onClose} />);

        fireEvent.click(screen.getByRole("button", { name: "Get started" }));
        expect(onClose).toHaveBeenCalledOnce();
    });
});
