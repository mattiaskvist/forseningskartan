import { createTheme } from "@mui/material/styles";
import { AppStyle } from "../types/appStyle";
import { getAppStyleThemeTokens } from "./appStyleTheme";

export function createAppMuiTheme(appStyle: AppStyle) {
    const tokens = getAppStyleThemeTokens(appStyle);

    return createTheme({
        palette: {
            mode: tokens.palette.mode,
            primary: { main: tokens.palette.primaryMain },
            background: {
                default: tokens.palette.backgroundDefault,
                paper: tokens.palette.backgroundPaper,
            },
            text: {
                primary: tokens.palette.textPrimary,
                secondary: tokens.palette.textSecondary,
            },
        },
        shape: { borderRadius: 8 },
        components: {
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundColor: tokens.surfaces.panelBg,
                        color: tokens.surfaces.appText,
                    },
                    outlined: {
                        borderColor: tokens.surfaces.panelBorder,
                    },
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        borderColor: tokens.surfaces.panelBorder,
                    },
                },
            },
            MuiButton: {
                defaultProps: {
                    disableElevation: true,
                },
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
                    root: {
                        display: "flex",
                        gap: 4,
                        flexWrap: "wrap",
                    },
                    grouped: {
                        margin: 0,
                        borderRadius: 6,
                        borderColor: tokens.surfaces.panelBorder,
                    },
                },
            },
            MuiToggleButton: {
                styleOverrides: {
                    root: {
                        color: tokens.surfaces.appTextMuted,
                        borderColor: tokens.surfaces.panelBorder,
                        backgroundColor: "transparent",
                        textTransform: "none",
                        fontWeight: 600,
                        "&:hover": {
                            backgroundColor: tokens.surfaces.surfaceHoverBg,
                            color: tokens.surfaces.appText,
                        },
                        "&.Mui-selected": {
                            backgroundColor: tokens.surfaces.navActiveBg,
                            color: tokens.surfaces.navActiveText,
                        },
                        "&.Mui-selected:hover": {
                            backgroundColor: tokens.surfaces.navActiveBg,
                        },
                    },
                },
            },
            MuiOutlinedInput: {
                styleOverrides: {
                    root: {
                        backgroundColor: tokens.surfaces.surfaceSubtleBg,
                        "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: tokens.surfaces.panelBorder,
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: tokens.surfaces.appTextMuted,
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: tokens.palette.primaryMain,
                        },
                    },
                    input: {
                        color: tokens.surfaces.appText,
                    },
                },
            },
            MuiInputLabel: {
                styleOverrides: {
                    root: {
                        color: tokens.surfaces.appTextMuted,
                    },
                },
            },
            MuiIconButton: {
                styleOverrides: {
                    root: {
                        color: tokens.surfaces.appTextMuted,
                    },
                },
            },
            MuiPaginationItem: {
                styleOverrides: {
                    root: {
                        color: tokens.surfaces.appTextMuted,
                        "&.Mui-selected": {
                            backgroundColor: tokens.surfaces.navActiveBg,
                            color: tokens.surfaces.navActiveText,
                        },
                    },
                },
            },
        },
    });
}
