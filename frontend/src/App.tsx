import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { getAggregatedDates, getSites, getStopPoints } from "./store/actions";
import { useAppDispatch } from "./store/store";
import { SidebarPresenter } from "./presenters/sidebarPresenter";
import { AccountPresenter } from "./presenters/accountPresenter";
import { LoginPresenter } from "./presenters/loginPresenter";
import { initializeAuthListener } from "./firebase/authActions";
import {
    getSitesLoadingCB,
    getStopPointsCB,
    getStopPointsLoadingCB,
    getSitesCB,
} from "./store/selectors";
import { Suspense } from "./components/Suspense";
import { GlobalSnackbar } from "./components/GlobalSnackbar";
import { ROUTES, type RouteConfig } from "./routes";

function App() {
    const dispatch = useAppDispatch();

    // Fetch sites, stop points, and aggregated dates on app load
    useEffect(() => {
        dispatch(getSites());
        dispatch(getStopPoints());
        dispatch(getAggregatedDates());

        // return the unsubscribe function to stop the firebase connection
        // if this component ever unmounts to prevent memory leaks.
        const unsubscribeCB = initializeAuthListener(dispatch);
        return unsubscribeCB;
    }, [dispatch]);

    function renderRouteCB(route: RouteConfig) {
        return <Route key={route.path} path={route.path} element={route.element} />;
    }

    return (
        <div className="relative h-screen w-screen overflow-hidden">
            <SidebarPresenter />
            <Routes>
                {ROUTES.map(renderRouteCB)}
                <Route path="/login" element={<LoginPresenter />} />
                <Route path="/account" element={<AccountPresenter />} />
            </Routes>
            <GlobalSnackbar />
        </div>
    );
}

export default App;
