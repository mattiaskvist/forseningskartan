import { useEffect, useMemo } from "react";
import { Routes, Route } from "react-router-dom";
import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { getAggregatedDates, getSites, getStopPoints } from "./store/actions";
import { useAppDispatch, useAppSelector } from "./store/store";
import { SidebarPresenter } from "./presenters/sidebarPresenter";
import { AccountPresenter } from "./presenters/accountPresenter";
import { LoginPresenter } from "./presenters/loginPresenter";
import { initializeAuthSync } from "./store/authThunks";
import { GlobalSnackbarPresenter } from "./presenters/globalSnackbarPresenter";
import { ROUTES, type RouteConfig } from "./routes";
import { getAppStylePreferenceCB } from "./store/selectors";
import { createAppMuiTheme } from "./theme/muiTheme";
import { getAppStyleCssVariables } from "./theme/appStyleTheme";

function App() {
    const dispatch = useAppDispatch();
    const appStyle = useAppSelector(getAppStylePreferenceCB);
    const muiTheme = useMemo(() => createAppMuiTheme(appStyle), [appStyle]);
    const appStyleVariables = useMemo(() => getAppStyleCssVariables(appStyle), [appStyle]);

    // Fetch sites, stop points, and aggregated dates on app load
    useEffect(() => {
        dispatch(getSites());
        dispatch(getStopPoints());
        dispatch(getAggregatedDates());

        // return the unsubscribe function to stop the firebase connection
        // if this component ever unmounts to prevent memory leaks.
        const unsubscribeCB = dispatch(initializeAuthSync());
        return unsubscribeCB;
    }, [dispatch]);

    function renderRouteCB(route: RouteConfig) {
        return <Route key={route.path} path={route.path} element={route.element} />;
    }

    return (
        <ThemeProvider theme={muiTheme}>
            <CssBaseline />
            <div
                style={appStyleVariables}
                className="app-shell relative h-screen w-screen overflow-hidden"
            >
                <SidebarPresenter />
                <Routes>
                    {ROUTES.map(renderRouteCB)}
                    <Route path="/login" element={<LoginPresenter />} />
                    <Route path="/account" element={<AccountPresenter />} />
                </Routes>
                <GlobalSnackbarPresenter />
            </div>
        </ThemeProvider>
    );
}

export default App;
