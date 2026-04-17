import { createTheme, type Theme } from "@mui/material/styles";
import { type AppStyle } from "../types/appStyle";

/* ── MUI module augmentation ── */

declare module "@mui/material/styles" {
    interface Palette {
        surface: {
            panelBg: string;
            panelBorder: string;
            panelTitle: string;
            subtleBg: string;
            hoverBg: string;
            navHoverBg: string;
            navHoverText: string;
            navActiveBg: string;
            navActiveText: string;
            sidebarBackdrop: string;
            avatarBg: string;
            avatarText: string;
        };
    }
    interface PaletteOptions {
        surface?: Partial<Palette["surface"]>;
    }
}

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
                        borderColor: theme.palette.surface.panelBorder,
                    }),
                },
            },
            MuiToggleButton: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        color: theme.palette.text.secondary,
                        borderColor: theme.palette.surface.panelBorder,
                        backgroundColor: "transparent",
                        textTransform: "none",
                        fontWeight: 600,
                        "&:hover": {
                            backgroundColor: theme.palette.surface.hoverBg,
                            color: theme.palette.text.primary,
                        },
                        "&.Mui-selected": {
                            backgroundColor: theme.palette.surface.navActiveBg,
                            color: theme.palette.surface.navActiveText,
                        },
                        "&.Mui-selected:hover": {
                            backgroundColor: theme.palette.surface.navActiveBg,
                        },
                    }),
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        backgroundColor: theme.palette.surface.panelBg,
                        color: theme.palette.text.primary,
                    }),
                    outlined: ({ theme }) => ({
                        borderColor: theme.palette.surface.panelBorder,
                    }),
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        borderColor: theme.palette.surface.panelBorder,
                    }),
                },
            },
            MuiOutlinedInput: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        backgroundColor: theme.palette.surface.subtleBg,
                        "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: theme.palette.surface.panelBorder,
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
                            backgroundColor: theme.palette.surface.navActiveBg,
                            color: theme.palette.surface.navActiveText,
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
            background: { default: "#0f172a", paper: "#1e293b" },
            text: { primary: "#e2e8f0", secondary: "#94a3b8" },
            surface: {
                panelBg: "rgba(15, 23, 42, 0.88)",
                panelBorder: "rgba(148, 163, 184, 0.45)",
                panelTitle: "#f8fafc",
                subtleBg: "rgba(51, 65, 85, 0.55)",
                hoverBg: "rgba(71, 85, 105, 0.65)",
                navHoverBg: "rgba(30, 41, 59, 0.9)",
                navHoverText: "#f8fafc",
                navActiveBg: "rgba(30, 64, 175, 0.45)",
                navActiveText: "#bfdbfe",
                sidebarBackdrop: "rgba(2, 6, 23, 0.45)",
                avatarBg: "rgba(51, 65, 85, 0.95)",
                avatarText: "#f8fafc",
            },
        },
    }),
    Light: createBaseTheme({
        palette: {
            mode: "light",
            primary: { main: "#2563eb" },
            background: { default: "#f1f5f9", paper: "#ffffff" },
            text: { primary: "#0f172a", secondary: "#475569" },
            surface: {
                panelBg: "rgba(255, 255, 255, 0.95)",
                panelBorder: "rgba(148, 163, 184, 0.55)",
                panelTitle: "#1e293b",
                subtleBg: "#e2e8f0",
                hoverBg: "#cbd5e1",
                navHoverBg: "#e2e8f0",
                navHoverText: "#0f172a",
                navActiveBg: "#dbeafe",
                navActiveText: "#1d4ed8",
                sidebarBackdrop: "rgba(15, 23, 42, 0.2)",
                avatarBg: "#e2e8f0",
                avatarText: "#1e293b",
            },
        },
    }),
    Classic: createBaseTheme({
        palette: {
            mode: "light",
            primary: { main: "#8b5e3b" },
            background: { default: "#f7f0df", paper: "#fff8e6" },
            text: { primary: "#3f2f1f", secondary: "#6b5842" },
            surface: {
                panelBg: "rgba(255, 248, 230, 0.95)",
                panelBorder: "rgba(166, 124, 82, 0.5)",
                panelTitle: "#3f2f1f",
                subtleBg: "rgba(217, 189, 151, 0.45)",
                hoverBg: "rgba(191, 141, 90, 0.45)",
                navHoverBg: "rgba(217, 189, 151, 0.5)",
                navHoverText: "#3f2f1f",
                navActiveBg: "rgba(191, 141, 90, 0.32)",
                navActiveText: "#6f3f19",
                sidebarBackdrop: "rgba(63, 47, 31, 0.3)",
                avatarBg: "rgba(217, 189, 151, 0.55)",
                avatarText: "#3f2f1f",
            },
        },
    }),
};

export function createAppMuiTheme(appStyle: AppStyle): Theme {
    return themes[appStyle];
}
