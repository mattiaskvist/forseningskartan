import { useMemo } from "react";
import { Routes, Route } from "react-router-dom";
import { CssBaseline, Box } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { useAppSelector } from "./store/store";
import { SidebarPresenter } from "./presenters/sidebarPresenter";
import { AccountPresenter } from "./presenters/accountPresenter";
import { LoginPresenter } from "./presenters/loginPresenter";
import { GlobalSnackbarPresenter } from "./presenters/globalSnackbarPresenter";
import { ROUTES, type RouteConfig } from "./routes";
import { getAppStylePreferenceCB } from "./store/selectors";
import { createAppMuiTheme } from "./theme/muiTheme";
import { AppStartupPresenter } from "./presenters/appStartupPresenter";

function App() {
    const appStyle = useAppSelector(getAppStylePreferenceCB);
    const muiTheme = useMemo(() => createAppMuiTheme(appStyle), [appStyle]);

    function renderRouteCB(route: RouteConfig) {
        return <Route key={route.path} path={route.path} element={route.element} />;
    }

    return (
        <ThemeProvider theme={muiTheme}>
            <CssBaseline />
            <Box
                className="relative h-screen w-screen overflow-hidden"
                sx={{ bgcolor: "background.default", color: "text.primary" }}
            >
                <AppStartupPresenter />
                <SidebarPresenter />
                <Routes>
                    {ROUTES.map(renderRouteCB)}
                    <Route path="/login" element={<LoginPresenter />} />
                    <Route path="/account" element={<AccountPresenter />} />
                </Routes>
                <GlobalSnackbarPresenter />
            </Box>
        </ThemeProvider>
    );
}

export default App;
