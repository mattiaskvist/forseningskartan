import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AuthUserState } from "../store/authSlice";
import { SidebarView } from "./sidebarView";
import { renderWithTheme } from "../test/renderWithTheme";
import { translations } from "../utils/translations";

// simulate a logged in user
const mockUser: AuthUserState = {
    uid: "uid-1",
    email: "test@example.com",
    displayName: "Test User",
    photoURL: null,
};

describe("SidebarView favorites", () => {
    it("shows favorite stops for logged in users", () => {
        // mock function to track click events
        const onSelectFavoriteStop = vi.fn();

        // render component with logged-in user and sample data
        renderWithTheme(
            <SidebarView
                isOpen
                currentPath="/"
                user={mockUser}
                favoriteStops={[
                    { id: 10, name: "Odenplan", gid: 10, lat: 0, lon: 0 },
                    { id: 20, name: "Fridhemsplan", gid: 20, lat: 0, lon: 0 },
                ]}
                onToggle={vi.fn()}
                onNavigate={vi.fn()}
                onLogout={vi.fn()}
                onSelectFavoriteStop={onSelectFavoriteStop}
                appStyle="Dark"
                onAppStyleChange={vi.fn()}
                currentLanguage="en"
                onLanguageChange={vi.fn()}
                t={translations.en.sideBar}
                tAppStyleSelector={translations.en.appStyleSelector}
            />
        );

        // verify the favorites section is visible
        expect(screen.getByText("Favorite stops")).toBeInTheDocument();

        // simulate clicking a specific stop
        fireEvent.click(screen.getByRole("button", { name: "Odenplan" }));

        // ensure the correct stop ID was passed to the callback
        expect(onSelectFavoriteStop).toHaveBeenCalledWith(10);
    });

    it("shows login prompt when no user is logged in", () => {
        renderWithTheme(
            <SidebarView
                isOpen
                currentPath="/"
                user={null}
                favoriteStops={[{ id: 10, name: "Odenplan", gid: 10, lat: 0, lon: 0 }]}
                onToggle={vi.fn()}
                onNavigate={vi.fn()}
                onLogout={vi.fn()}
                onSelectFavoriteStop={vi.fn()}
                appStyle="Dark"
                onAppStyleChange={vi.fn()}
                currentLanguage="en"
                onLanguageChange={vi.fn()}
                t={translations.en.sideBar}
                tAppStyleSelector={translations.en.appStyleSelector}
            />
        );

        expect(screen.getByText("Favorite stops")).toBeInTheDocument();
        expect(screen.getByText("Log in to favorite stops")).toBeInTheDocument();
    });

    it("shows guidance when user has no favorite stops", () => {
        renderWithTheme(
            <SidebarView
                isOpen
                currentPath="/"
                user={mockUser}
                favoriteStops={[]}
                onToggle={vi.fn()}
                onNavigate={vi.fn()}
                onLogout={vi.fn()}
                onSelectFavoriteStop={vi.fn()}
                appStyle="Dark"
                onAppStyleChange={vi.fn()}
                currentLanguage="en"
                onLanguageChange={vi.fn()}
                t={translations.en.sideBar}
                tAppStyleSelector={translations.en.appStyleSelector}
            />
        );

        expect(screen.getByText("Favorite stops")).toBeInTheDocument();
        expect(screen.getByText("Select a stop to favorite it")).toBeInTheDocument();
    });

    it("lets users change app style in the sidebar", () => {
        const onAppStyleChange = vi.fn();

        renderWithTheme(
            <SidebarView
                isOpen
                currentPath="/"
                user={mockUser}
                favoriteStops={[]}
                onToggle={vi.fn()}
                onNavigate={vi.fn()}
                onLogout={vi.fn()}
                onSelectFavoriteStop={vi.fn()}
                appStyle="Dark"
                onAppStyleChange={onAppStyleChange}
                currentLanguage="en"
                onLanguageChange={vi.fn()}
                t={translations.en.sideBar}
                tAppStyleSelector={translations.en.appStyleSelector}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: "Light" }));
        expect(onAppStyleChange).toHaveBeenCalledWith("Light");
    });
});
