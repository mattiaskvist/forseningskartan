import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AccountView } from "./accountView";
import { renderWithTheme } from "../test/renderWithTheme";
import { translations } from "../utils/translations";

describe("AccountView", () => {
    it("calls onDelete directly when delete button is clicked", () => {
        const onDelete = vi.fn();

        renderWithTheme(
            <AccountView
                user={{
                    uid: "uid-1",
                    email: "test@example.com",
                    displayName: "Test User",
                    photoURL: null,
                }}
                onLogout={vi.fn()}
                onDelete={onDelete}
                t={translations.en.account}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: "Delete Account" }));
        expect(onDelete).toHaveBeenCalledTimes(1);
    });
});
