import { createTheme } from "@mui/material/styles";
import { AppStyle } from "../types/appStyle";

export function createAppMuiTheme(appStyle: AppStyle) {
    if (appStyle === "Dark") {
        return createTheme({
            palette: {
                mode: "dark",
                primary: { main: "#60a5fa" },
                background: {
                    default: "#0f172a",
                    paper: "#1e293b",
                },
            },
        });
    }

    if (appStyle === "Classic") {
        return createTheme({
            palette: {
                mode: "light",
                primary: { main: "#8b5e3b" },
                background: {
                    default: "#f7f0df",
                    paper: "#fff8e6",
                },
                text: {
                    primary: "#3f2f1f",
                    secondary: "#6b5842",
                },
            },
        });
    }

    return createTheme({
        palette: {
            mode: "light",
            primary: { main: "#2563eb" },
            background: {
                default: "#f1f5f9",
                paper: "#ffffff",
            },
        },
    });
}
