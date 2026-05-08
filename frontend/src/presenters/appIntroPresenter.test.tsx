import { configureStore } from "@reduxjs/toolkit";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { beforeEach, describe, expect, it } from "vitest";
import { Provider } from "react-redux";
import { createAppMuiTheme } from "../theme/muiTheme";
import { authSlice } from "../store/authSlice";
import { defaultUserPreferencesState, userPreferencesSlice } from "../store/userPreferencesSlice";
import { AppIntroPresenter } from "./appIntroPresenter";

const storage = new Map<string, string>();
const testTheme = createAppMuiTheme("Dark");

type RenderPresenterOptions = {
    hasSeenAppIntro?: boolean;
    isAuthLoading?: boolean;
    isLoadingFirebasePreferences?: boolean;
};

function renderPresenter({
    hasSeenAppIntro = false,
    isAuthLoading = false,
    isLoadingFirebasePreferences = false,
}: RenderPresenterOptions = {}) {
    const store = configureStore({
        reducer: {
            auth: authSlice.reducer,
            userPreferences: userPreferencesSlice.reducer,
        },
        preloadedState: {
            auth: {
                user: isAuthLoading
                    ? null
                    : {
                          uid: "test-user",
                          email: "test@example.com",
                          displayName: "Test User",
                          photoURL: null,
                      },
                loading: isAuthLoading,
                error: null,
            },
            userPreferences: {
                ...defaultUserPreferencesState,
                hasSeenAppIntro,
                isLoadingFirebasePreferences,
            },
        },
    });

    return render(
        <Provider store={store}>
            <ThemeProvider theme={testTheme}>
                <AppIntroPresenter />
            </ThemeProvider>
        </Provider>
    );
}

describe("AppIntroPresenter", () => {
    beforeEach(() => {
        storage.clear();
        Object.defineProperty(globalThis, "localStorage", {
            configurable: true,
            value: {
                getItem: (key: string) => storage.get(key) ?? null,
                setItem: (key: string, value: string) => storage.set(key, value),
            },
        });
    });

    it("shows the app intro when it has not been dismissed", () => {
        renderPresenter();

        expect(screen.getByText("Welcome to Förseningskartan")).toBeInTheDocument();
    });

    it("does not show the app intro after it has been dismissed before", () => {
        renderPresenter({ hasSeenAppIntro: true });

        expect(screen.queryByText("Welcome to Förseningskartan")).not.toBeInTheDocument();
    });

    it("does not show the app intro while auth is loading", () => {
        renderPresenter({ isAuthLoading: true });

        expect(screen.queryByText("Welcome to Förseningskartan")).not.toBeInTheDocument();
    });

    it("does not show the app intro while Firebase preferences are loading", () => {
        renderPresenter({ isLoadingFirebasePreferences: true });

        expect(screen.queryByText("Welcome to Förseningskartan")).not.toBeInTheDocument();
    });

    it("stores dismissal when the user closes the intro", () => {
        renderPresenter();

        fireEvent.click(screen.getByRole("button", { name: "Get started" }));

        expect(localStorage.getItem("hasSeenIntro")).toBe("true");
        return waitFor(() => {
            expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        });
    });
});
