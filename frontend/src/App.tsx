import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { getAggregatedDates, getSites, getStopPoints } from "./store/actions";
import { useAppDispatch, useAppSelector } from "./store/store";
import { SidebarPresenter } from "./presenters/sidebarPresenter";
import {
    getSitesLoadingCB,
    getStopPointsCB,
    getStopPointsLoadingCB,
    getSitesCB,
} from "./store/selectors";
import { Suspense } from "./components/Suspense";
import { ROUTES, type RouteConfig } from "./routes";

function App() {
    const dispatch = useAppDispatch();

    // Fetch sites, stop points, and aggregated dates on app load
    useEffect(() => {
        dispatch(getSites());
        dispatch(getStopPoints());
        dispatch(getAggregatedDates());
    }, [dispatch]);

    const sites = useAppSelector(getSitesCB);
    const isSitesLoading = useAppSelector(getSitesLoadingCB);
    const stopPoints = useAppSelector(getStopPointsCB);
    const isStopPointsLoading = useAppSelector(getStopPointsLoadingCB);

    // TODO: this loading should probably only be checked when on the map page
    if (isSitesLoading || !sites || isStopPointsLoading || !stopPoints) {
        return <Suspense fullscreen message="Loading transit data and preparing the map..." />;
    }

    function renderRouteCB(route: RouteConfig) {
        return <Route key={route.path} path={route.path} element={route.element} />;
    }

    return (
        <div className="relative h-screen w-screen overflow-hidden">
            <SidebarPresenter />
            <Routes>{ROUTES.map(renderRouteCB)}</Routes>
        </div>
    );
}

export default App;
