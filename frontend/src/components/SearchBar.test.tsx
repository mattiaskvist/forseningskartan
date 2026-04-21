import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SearchBar } from "./SearchBar";
import { renderWithTheme } from "../test/renderWithTheme";

// Simplified fixture
const sites = [
    { id: 1, gid: 1001, name: "Alpha", lat: 59.1, lon: 18.1 },
    { id: 2, gid: 1002, name: "Beta", lat: 59.2, lon: 18.2 },
    { id: 3, gid: 1003, name: "Gamma", lat: 59.3, lon: 18.3 },
];

describe("SearchBar", () => {
    it("sorts recent searches first and displays history icons", async () => {
        renderWithTheme(
            <SearchBar
                sites={sites}
                selectedSite={null}
                handleSelectSiteCB={() => {}}
                recentSearchSiteIds={[3, 1]}
            />
        );

        // access the MUI Autocomplete input and open the options list
        const input = screen.getByRole("combobox", { name: "Search stops" });
        fireEvent.focus(input);
        fireEvent.keyDown(input, { key: "ArrowDown" });

        const options = await screen.findAllByRole("option");

        expect(options.map((o) => o.textContent)).toEqual(["Gamma", "Alpha", "Beta"]);

        // check that the history icon is shown for recent searches and not for non-recent ones
        expect(within(options[0]).getByTestId("HistoryIcon")).toBeInTheDocument();
        expect(within(options[1]).getByTestId("HistoryIcon")).toBeInTheDocument();
        expect(within(options[2]).queryByTestId("HistoryIcon")).not.toBeInTheDocument();
    });

    it("bubbles recent matches to the top when filtering by input", async () => {
        renderWithTheme(
            <SearchBar
                sites={sites}
                selectedSite={null}
                handleSelectSiteCB={() => {}}
                recentSearchSiteIds={[2]}
            />
        );

        const input = screen.getByRole("combobox", { name: "Search stops" });
        // 'a' matches all 3 sites, but Beta (id: 2) is a recent search
        fireEvent.change(input, { target: { value: "a" } });
        fireEvent.keyDown(input, { key: "ArrowDown" });

        const options = await screen.findAllByRole("option");

        // beta should be first because it's a recent search
        expect(options.map((o) => o.textContent)).toEqual(["Beta", "Alpha", "Gamma"]);
        expect(within(options[0]).getByTestId("HistoryIcon")).toBeInTheDocument();
    });
});
