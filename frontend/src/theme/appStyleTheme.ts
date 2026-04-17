import { type CSSProperties } from "react";
import { type PaletteMode } from "@mui/material";
import { type AppStyle } from "../types/appStyle";

type AppPaletteTokens = {
    mode: PaletteMode;
    primaryMain: string;
    backgroundDefault: string;
    backgroundPaper: string;
    textPrimary: string;
    textSecondary: string;
};

type AppSurfaceTokens = {
    appBg: string;
    appText: string;
    appTextMuted: string;
    panelBg: string;
    panelBorder: string;
    panelTitle: string;
    surfaceSubtleBg: string;
    surfaceHoverBg: string;
    navHoverBg: string;
    navHoverText: string;
    navActiveBg: string;
    navActiveText: string;
    sidebarBackdrop: string;
    buttonPrimaryBg: string;
    buttonPrimaryHover: string;
    buttonPrimaryText: string;
    buttonSecondaryBg: string;
    buttonSecondaryBorder: string;
    buttonSecondaryText: string;
    buttonDangerBg: string;
    buttonDangerBorder: string;
    buttonDangerText: string;
    avatarBg: string;
    avatarText: string;
};

export type AppStyleThemeTokens = {
    palette: AppPaletteTokens;
    surfaces: AppSurfaceTokens;
};

export const appStyleThemeTokens: Record<AppStyle, AppStyleThemeTokens> = {
    Dark: {
        palette: {
            mode: "dark",
            primaryMain: "#60a5fa",
            backgroundDefault: "#0f172a",
            backgroundPaper: "#1e293b",
            textPrimary: "#e2e8f0",
            textSecondary: "#94a3b8",
        },
        surfaces: {
            appBg: "#0f172a",
            appText: "#e2e8f0",
            appTextMuted: "#94a3b8",
            panelBg: "rgba(15, 23, 42, 0.88)",
            panelBorder: "rgba(148, 163, 184, 0.45)",
            panelTitle: "#f8fafc",
            surfaceSubtleBg: "rgba(51, 65, 85, 0.55)",
            surfaceHoverBg: "rgba(71, 85, 105, 0.65)",
            navHoverBg: "rgba(30, 41, 59, 0.9)",
            navHoverText: "#f8fafc",
            navActiveBg: "rgba(30, 64, 175, 0.45)",
            navActiveText: "#bfdbfe",
            sidebarBackdrop: "rgba(2, 6, 23, 0.45)",
            buttonPrimaryBg: "#2563eb",
            buttonPrimaryHover: "#1d4ed8",
            buttonPrimaryText: "#ffffff",
            buttonSecondaryBg: "rgba(15, 23, 42, 0.8)",
            buttonSecondaryBorder: "rgba(148, 163, 184, 0.45)",
            buttonSecondaryText: "#e2e8f0",
            buttonDangerBg: "rgba(127, 29, 29, 0.35)",
            buttonDangerBorder: "rgba(239, 68, 68, 0.45)",
            buttonDangerText: "#fecaca",
            avatarBg: "rgba(51, 65, 85, 0.95)",
            avatarText: "#f8fafc",
        },
    },
    Light: {
        palette: {
            mode: "light",
            primaryMain: "#2563eb",
            backgroundDefault: "#f1f5f9",
            backgroundPaper: "#ffffff",
            textPrimary: "#0f172a",
            textSecondary: "#475569",
        },
        surfaces: {
            appBg: "#f1f5f9",
            appText: "#0f172a",
            appTextMuted: "#475569",
            panelBg: "rgba(255, 255, 255, 0.95)",
            panelBorder: "rgba(148, 163, 184, 0.55)",
            panelTitle: "#1e293b",
            surfaceSubtleBg: "#e2e8f0",
            surfaceHoverBg: "#cbd5e1",
            navHoverBg: "#e2e8f0",
            navHoverText: "#0f172a",
            navActiveBg: "#dbeafe",
            navActiveText: "#1d4ed8",
            sidebarBackdrop: "rgba(15, 23, 42, 0.2)",
            buttonPrimaryBg: "#2563eb",
            buttonPrimaryHover: "#1d4ed8",
            buttonPrimaryText: "#ffffff",
            buttonSecondaryBg: "#ffffff",
            buttonSecondaryBorder: "rgba(148, 163, 184, 0.6)",
            buttonSecondaryText: "#1e293b",
            buttonDangerBg: "#fef2f2",
            buttonDangerBorder: "#fecaca",
            buttonDangerText: "#dc2626",
            avatarBg: "#e2e8f0",
            avatarText: "#1e293b",
        },
    },
    Classic: {
        palette: {
            mode: "light",
            primaryMain: "#8b5e3b",
            backgroundDefault: "#f7f0df",
            backgroundPaper: "#fff8e6",
            textPrimary: "#3f2f1f",
            textSecondary: "#6b5842",
        },
        surfaces: {
            appBg: "#f7f0df",
            appText: "#3f2f1f",
            appTextMuted: "#6b5842",
            panelBg: "rgba(255, 248, 230, 0.95)",
            panelBorder: "rgba(166, 124, 82, 0.5)",
            panelTitle: "#3f2f1f",
            surfaceSubtleBg: "rgba(217, 189, 151, 0.45)",
            surfaceHoverBg: "rgba(191, 141, 90, 0.45)",
            navHoverBg: "rgba(217, 189, 151, 0.5)",
            navHoverText: "#3f2f1f",
            navActiveBg: "rgba(191, 141, 90, 0.32)",
            navActiveText: "#6f3f19",
            sidebarBackdrop: "rgba(63, 47, 31, 0.3)",
            buttonPrimaryBg: "#8b5e3b",
            buttonPrimaryHover: "#70492b",
            buttonPrimaryText: "#fff8e6",
            buttonSecondaryBg: "#fff8e6",
            buttonSecondaryBorder: "rgba(166, 124, 82, 0.5)",
            buttonSecondaryText: "#3f2f1f",
            buttonDangerBg: "rgba(127, 29, 29, 0.08)",
            buttonDangerBorder: "rgba(185, 28, 28, 0.35)",
            buttonDangerText: "#991b1b",
            avatarBg: "rgba(217, 189, 151, 0.55)",
            avatarText: "#3f2f1f",
        },
    },
};

export function getAppStyleThemeTokens(appStyle: AppStyle): AppStyleThemeTokens {
    return appStyleThemeTokens[appStyle];
}

type CssVariableProperties = CSSProperties & Record<`--${string}`, string>;

export function getAppStyleCssVariables(appStyle: AppStyle): CssVariableProperties {
    const { surfaces } = getAppStyleThemeTokens(appStyle);

    return {
        "--app-bg": surfaces.appBg,
        "--app-text": surfaces.appText,
        "--app-text-muted": surfaces.appTextMuted,
        "--panel-bg": surfaces.panelBg,
        "--panel-border": surfaces.panelBorder,
        "--panel-title": surfaces.panelTitle,
        "--surface-subtle-bg": surfaces.surfaceSubtleBg,
        "--surface-hover-bg": surfaces.surfaceHoverBg,
        "--nav-hover-bg": surfaces.navHoverBg,
        "--nav-hover-text": surfaces.navHoverText,
        "--nav-active-bg": surfaces.navActiveBg,
        "--nav-active-text": surfaces.navActiveText,
        "--sidebar-backdrop": surfaces.sidebarBackdrop,
        "--button-primary-bg": surfaces.buttonPrimaryBg,
        "--button-primary-hover": surfaces.buttonPrimaryHover,
        "--button-primary-text": surfaces.buttonPrimaryText,
        "--button-secondary-bg": surfaces.buttonSecondaryBg,
        "--button-secondary-border": surfaces.buttonSecondaryBorder,
        "--button-secondary-text": surfaces.buttonSecondaryText,
        "--button-danger-bg": surfaces.buttonDangerBg,
        "--button-danger-border": surfaces.buttonDangerBorder,
        "--button-danger-text": surfaces.buttonDangerText,
        "--avatar-bg": surfaces.avatarBg,
        "--avatar-text": surfaces.avatarText,
    };
}
