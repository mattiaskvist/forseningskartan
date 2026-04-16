import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AuthUserState } from "../store/authSlice";
import { SidebarView } from "./sidebarView";

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
        render(
            <SidebarView
                isOpen
                currentPath="/"
                user={mockUser}
                favoriteStops={[
                    { id: 10, name: "Odenplan" },
                    { id: 20, name: "Fridhemsplan" },
                ]}
                onToggle={vi.fn()}
                onNavigate={vi.fn()}
                onLogout={vi.fn()}
                onSelectFavoriteStop={onSelectFavoriteStop}
            />
        );

        // verify the favorites section is visible
        expect(screen.getByText("Favorite stops")).toBeInTheDocument();

        // simulate clicking a specific stop
        fireEvent.click(screen.getByRole("button", { name: "Odenplan" }));

        // ensure the correct stop ID was passed to the callback
        expect(onSelectFavoriteStop).toHaveBeenCalledWith(10);
    });

    it("hides favorite stops when no user is logged in", () => {
        // render component as a guest (user is null)
        render(
            <SidebarView
                isOpen
                currentPath="/"
                user={null}
                favoriteStops={[{ id: 10, name: "Odenplan" }]}
                onToggle={vi.fn()}
                onNavigate={vi.fn()}
                onLogout={vi.fn()}
                onSelectFavoriteStop={vi.fn()}
            />
        );

        // verify the favorites section does not exist
        expect(screen.queryByText("Favorite stops")).not.toBeInTheDocument();
    });
});
