import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../test/renderWithTheme";
import { translations } from "../utils/translations";
import { AppIntroView } from "./appIntroView";

const appIntroViewProps = {
    isOpen: true,
    currentLanguage: "en" as const,
    t: translations.en.appIntro,
    tLanguageSelector: translations.en.sideBar.languageSelector,
};

describe("AppIntroView", () => {
    it("renders the core workflow intro when open", () => {
        renderWithTheme(
            <AppIntroView {...appIntroViewProps} onClose={vi.fn()} onLanguageChange={vi.fn()} />
        );

        expect(screen.getByText("Welcome to Förseningskartan")).toBeInTheDocument();
        expect(screen.getByText("Find a stop")).toBeInTheDocument();
        expect(screen.getByText("Check live departures")).toBeInTheDocument();
        expect(screen.getByText("Compare historical delays")).toBeInTheDocument();
        expect(screen.getByText("Explore route delays")).toBeInTheDocument();
    });

    it("calls onClose from the get started button", () => {
        const onClose = vi.fn();

        renderWithTheme(
            <AppIntroView {...appIntroViewProps} onClose={onClose} onLanguageChange={vi.fn()} />
        );

        fireEvent.click(screen.getByRole("button", { name: "Get started" }));
        expect(onClose).toHaveBeenCalledOnce();
    });

    it("calls onLanguageChange from the language selector", () => {
        const onLanguageChange = vi.fn();

        renderWithTheme(
            <AppIntroView
                {...appIntroViewProps}
                onClose={vi.fn()}
                onLanguageChange={onLanguageChange}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: "Swedish" }));
        expect(onLanguageChange).toHaveBeenCalledWith("sv");
    });
});
