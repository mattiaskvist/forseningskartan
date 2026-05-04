import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AccountView } from "./accountView";
import { renderWithTheme } from "../test/renderWithTheme";
import { translations } from "../utils/translations";

describe("AccountView", () => {
    it("calls onDeleteConfirmed after confirming delete", () => {
        const onDelete = vi.fn();
        const t = translations.en.account;

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
                t={t}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: t.deleteAccount }));
        fireEvent.click(screen.getByRole("button", { name: t.deleteAccount }));
        expect(onDelete).toHaveBeenCalledTimes(1);
    });

    it("does not call onDelete when delete is cancelled", () => {
        const onDelete = vi.fn();
        const t = translations.en.account;

        renderWithTheme(
            <AccountView
                user={{
                    uid: "uid-2",
                    email: "test2@example.com",
                    displayName: "Test User 2",
                    photoURL: null,
                }}
                onLogout={vi.fn()}
                onDelete={onDelete}
                t={t}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: t.deleteAccount }));
        fireEvent.click(screen.getByRole("button", { name: t.cancelDelete }));
        expect(onDelete).not.toHaveBeenCalled();
    });
});
