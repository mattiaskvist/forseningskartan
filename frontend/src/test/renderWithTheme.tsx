import { type ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { createAppMuiTheme } from "../theme/muiTheme";

const testTheme = createAppMuiTheme("Dark");

/**
 * render() wrapper that provides the MUI ThemeProvider with
 * our custom palette (including palette.surface).
 */
export function renderWithTheme(ui: ReactElement, options?: RenderOptions) {
    return render(<ThemeProvider theme={testTheme}>{ui}</ThemeProvider>, options);
}
