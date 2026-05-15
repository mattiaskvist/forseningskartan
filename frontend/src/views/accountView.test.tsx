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
                isDeleteDialogOpen={true}
                onDeleteRequested={vi.fn()}
                onDeleteCancelled={vi.fn()}
                onDeleteConfirmed={onDelete}
                t={t}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: t.deleteAccount }));
        expect(onDelete).toHaveBeenCalledTimes(1);
    });

    it("does not call onDelete when delete is cancelled", () => {
        const onDeleteCancelled = vi.fn();
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
                isDeleteDialogOpen={true}
                onDeleteRequested={vi.fn()}
                onDeleteCancelled={onDeleteCancelled}
                onDeleteConfirmed={vi.fn()}
                t={t}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: t.cancelDelete }));
        expect(onDeleteCancelled).toHaveBeenCalledTimes(1);
    });

    it("requests delete through the presenter callback", () => {
        const onDeleteRequested = vi.fn();
        const t = translations.en.account;

        renderWithTheme(
            <AccountView
                user={{
                    uid: "uid-3",
                    email: "test3@example.com",
                    displayName: "Test User 3",
                    photoURL: null,
                }}
                onLogout={vi.fn()}
                isDeleteDialogOpen={false}
                onDeleteRequested={onDeleteRequested}
                onDeleteCancelled={vi.fn()}
                onDeleteConfirmed={vi.fn()}
                t={t}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: t.deleteAccount }));
        expect(onDeleteRequested).toHaveBeenCalledTimes(1);
    });
});
