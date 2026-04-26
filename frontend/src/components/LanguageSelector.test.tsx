import { render, screen } from "@testing-library/react";
import { LanguageSelector } from "./LanguageSelector";
import { describe, it, expect, vi } from "vitest";
import { translations } from "../utils/translations";

describe("LanguageSelector", () => {
    it("renders language options with flag emojis", () => {
        const mockOnChange = vi.fn();
        render(
            <LanguageSelector
                currentLanguage="en"
                onLanguageChange={mockOnChange}
                t={translations.en.sideBar.languageSelector}
            />
        );

        expect(screen.getByText(/🇬🇧/)).toBeInTheDocument();
        expect(screen.getByText(/🇸🇪/)).toBeInTheDocument();
        expect(screen.getByLabelText("English")).toBeInTheDocument();
        expect(screen.getByLabelText("Swedish")).toBeInTheDocument();
    });

    it("marks current language as selected", () => {
        const mockOnChange = vi.fn();
        const { rerender } = render(
            <LanguageSelector
                currentLanguage="en"
                onLanguageChange={mockOnChange}
                t={translations.en.sideBar.languageSelector}
            />
        );

        const enButton = screen.getByRole("button", { name: /English/i });
        expect(enButton).toHaveAttribute("aria-pressed", "true");

        rerender(
            <LanguageSelector
                currentLanguage="sv"
                onLanguageChange={mockOnChange}
                t={translations.en.sideBar.languageSelector}
            />
        );
        const svButton = screen.getByRole("button", { name: /Swedish/i });
        expect(svButton).toHaveAttribute("aria-pressed", "true");
    });

    it("has proper aria labels for accessibility", () => {
        const mockOnChange = vi.fn();
        render(
            <LanguageSelector
                currentLanguage="en"
                onLanguageChange={mockOnChange}
                t={translations.en.sideBar.languageSelector}
            />
        );

        expect(screen.getByLabelText("Select language")).toBeInTheDocument();
        expect(screen.getByLabelText("English")).toBeInTheDocument();
        expect(screen.getByLabelText("Swedish")).toBeInTheDocument();
    });
});
