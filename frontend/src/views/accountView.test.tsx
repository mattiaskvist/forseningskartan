import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AccountView } from "./accountView";

describe("AccountView", () => {
    it("calls onDelete directly when delete button is clicked", () => {
        const onDelete = vi.fn();

        render(
            <AccountView
                user={{
                    uid: "uid-1",
                    email: "test@example.com",
                    displayName: "Test User",
                    photoURL: null,
                }}
                onLogout={vi.fn()}
                onDelete={onDelete}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: "Delete Account" }));
        expect(onDelete).toHaveBeenCalledTimes(1);
    });
});
