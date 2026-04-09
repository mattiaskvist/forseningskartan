import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AuthUserState {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
}

export interface AuthState {
    user: AuthUserState | null;
    loading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    loading: true, // Initially loading until auth state is resolved by Firebase
    error: null,
};

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<AuthUserState | null>) => {
            state.user = action.payload;
            state.loading = false;
        },
        setAuthLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setAuthError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
            state.loading = false;
        },
    },
});

export const { setUser, setAuthLoading, setAuthError } = authSlice.actions;
