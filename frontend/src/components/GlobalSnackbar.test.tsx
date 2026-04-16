import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GlobalSnackbar } from "./GlobalSnackbar";

describe("GlobalSnackbar", () => {
    it("renders message and severity from props", () => {
        render(
            <GlobalSnackbar
                isOpen
                message="Saved successfully"
                severity="success"
                onClose={vi.fn()}
            />
        );

        expect(screen.getByText("Saved successfully")).toBeInTheDocument();
        expect(screen.getByRole("alert")).toHaveTextContent("Saved successfully");
    });

    it("calls onClose when close button is clicked", () => {
        const onClose = vi.fn();

        render(
            <GlobalSnackbar
                isOpen
                message="Saved successfully"
                severity="success"
                onClose={onClose}
            />
        );

        fireEvent.click(screen.getByLabelText(/close/i));
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
