import { createTheme, type Theme } from "@mui/material/styles";
import { type AppStyle } from "../types/appStyle";

/* ── Theme definitions ── */

function createBaseTheme(palette: Parameters<typeof createTheme>[0]): Theme {
    return createTheme({
        ...palette,
        shape: { borderRadius: 8 },
        components: {
            MuiButton: {
                defaultProps: { disableElevation: true },
                styleOverrides: {
                    root: {
                        borderRadius: 8,
                        textTransform: "none",
                        fontWeight: 600,
                    },
                },
            },
            MuiToggleButtonGroup: {
                styleOverrides: {
                    root: { display: "flex", gap: 4, flexWrap: "wrap" },
                    grouped: ({ theme }) => ({
                        margin: 0,
                        borderRadius: 6,
                        borderColor: theme.palette.divider,
                    }),
                },
            },
            MuiToggleButton: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        color: theme.palette.text.secondary,
                        borderColor: theme.palette.divider,
                        backgroundColor: "transparent",
                        textTransform: "none",
                        fontWeight: 600,
                        "&:hover": {
                            backgroundColor: theme.palette.action.hover,
                            color: theme.palette.text.primary,
                        },
                        "&.Mui-selected": {
                            backgroundColor: theme.palette.action.selected,
                            color: theme.palette.primary.main,
                        },
                        "&.Mui-selected:hover": {
                            backgroundColor: theme.palette.action.selected,
                        },
                    }),
                },
            },
            MuiPaper: {
                styleOverrides: {
                    outlined: ({ theme }) => ({
                        borderColor: theme.palette.divider,
                    }),
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        borderColor: theme.palette.divider,
                    }),
                },
            },
            MuiOutlinedInput: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        backgroundColor: theme.palette.action.hover,
                        "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: theme.palette.divider,
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: theme.palette.text.secondary,
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: theme.palette.primary.main,
                        },
                    }),
                    input: ({ theme }) => ({
                        color: theme.palette.text.primary,
                    }),
                },
            },
            MuiInputLabel: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        color: theme.palette.text.secondary,
                    }),
                },
            },
            MuiIconButton: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        color: theme.palette.text.secondary,
                    }),
                },
            },
            MuiPaginationItem: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        color: theme.palette.text.secondary,
                        "&.Mui-selected": {
                            backgroundColor: theme.palette.action.selected,
                            color: theme.palette.primary.main,
                        },
                    }),
                },
            },
        },
    });
}

const themes: Record<AppStyle, Theme> = {
    Dark: createBaseTheme({
        palette: {
            mode: "dark",
            primary: { main: "#60a5fa" },
            background: { default: "#0f172a", paper: "rgba(15, 23, 42, 0.88)" },
            text: { primary: "#e2e8f0", secondary: "#94a3b8" },
            divider: "rgba(148, 163, 184, 0.45)",
            action: {
                hover: "rgba(71, 85, 105, 0.65)",
                selected: "rgba(30, 64, 175, 0.45)",
            },
        },
    }),
    Light: createBaseTheme({
        palette: {
            mode: "light",
            primary: { main: "#2563eb" },
            background: { default: "#f1f5f9", paper: "rgba(255, 255, 255, 0.95)" },
            text: { primary: "#0f172a", secondary: "#475569" },
            divider: "rgba(148, 163, 184, 0.55)",
            action: {
                hover: "#cbd5e1",
                selected: "#dbeafe",
            },
        },
    }),
    Classic: createBaseTheme({
        palette: {
            mode: "light",
            primary: { main: "#8b5e3b" },
            background: { default: "#f7f0df", paper: "rgba(255, 248, 230, 0.95)" },
            text: { primary: "#3f2f1f", secondary: "#6b5842" },
            divider: "rgba(166, 124, 82, 0.5)",
            action: {
                hover: "rgba(191, 141, 90, 0.45)",
                selected: "rgba(191, 141, 90, 0.32)",
            },
        },
    }),
};

export function createAppMuiTheme(appStyle: AppStyle): Theme {
    return themes[appStyle];
}
