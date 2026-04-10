import { createSlice } from "@reduxjs/toolkit";

export type SnackbarSeverity = "success" | "info" | "warning" | "error";

type SnackbarPayload = {
    message: string;
    severity: SnackbarSeverity;
};

type SnackbarState = {
    open: boolean;
    message: string;
    severity: SnackbarSeverity;
};

const initialState: SnackbarState = {
    open: false,
    message: "",
    severity: "info",
};

export const snackbarSlice = createSlice({
    name: "snackbar",
    initialState,
    reducers: {
        showSnackbar: (state, action: { payload: SnackbarPayload }) => {
            state.open = true;
            state.message = action.payload.message;
            state.severity = action.payload.severity;
        },
        hideSnackbar: (state) => {
            state.open = false;
        },
    },
});

export const { showSnackbar, hideSnackbar } = snackbarSlice.actions;
