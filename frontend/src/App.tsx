import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { MapPresenter } from "./presenters/mapPresenter";
import { getAggregatedDates, getSites, getStopPoints } from "./store/actions";
import { useAppDispatch, useAppSelector } from "./store/store";
import { DeparturePresenter } from "./presenters/departurePresenter";
import { RouteDelayPresenter } from "./presenters/RouteDelayPresenter";
import { SidebarPresenter } from "./presenters/sidebarPresenter";
import { AccountPresenter } from "./presenters/accountPresenter";
import { LoginPresenter } from "./presenters/loginPresenter";
import { initializeAuthListener } from "./firebase/authActions";
import {
    getSelectedSiteCB,
    getSitesLoadingCB,
    getSitesCB,
    getStopPointsCB,
    getStopPointsLoadingCB,
} from "./store/selectors";
import { Suspense } from "./components/Suspense";

function App() {
    const dispatch = useAppDispatch();

    // Fetch sites, stop points, and aggregated dates on app load
    useEffect(() => {
        dispatch(getSites());
        dispatch(getStopPoints());
        dispatch(getAggregatedDates());
        const unsubscribe = initializeAuthListener();
        return () => unsubscribe();
    }, [dispatch]);

    const sites = useAppSelector(getSitesCB);
    const selectedSite = useAppSelector(getSelectedSiteCB);
    const isSitesLoading = useAppSelector(getSitesLoadingCB);
    const stopPoints = useAppSelector(getStopPointsCB);
    const isStopPointsLoading = useAppSelector(getStopPointsLoadingCB);
    if (isSitesLoading || !sites || isStopPointsLoading || !stopPoints) {
        return <Suspense fullscreen message="Loading transit data and preparing the map..." />;
    }

    return (
        <div className="relative h-screen w-screen overflow-hidden">
            <SidebarPresenter />
            <Routes>
                <Route
                    path="/"
                    element={
                        <>
                            <MapPresenter sites={sites} />
                            {selectedSite && (
                                <aside className="pointer-events-auto absolute right-4 top-4 z-1000 w-[min(420px,calc(100vw-2rem))]">
                                    <div className="flex max-h-[calc(100vh-2rem)] flex-col gap-3 overflow-y-auto pr-1">
                                        <section className="overlay-panel">
                                            <h2 className="overlay-panel-title">Departures</h2>
                                            <DeparturePresenter selectedSite={selectedSite} />
                                        </section>
                                    </div>
                                </aside>
                            )}
                        </>
                    }
                />
                <Route
                    path="/route-delays"
                    element={
                        <div className="flex h-screen w-full items-start justify-center overflow-y-auto bg-slate-50 p-8 pt-20">
                            <section className="overlay-panel w-full max-w-3xl">
                                <h2 className="overlay-panel-title">Route Delays</h2>
                                <RouteDelayPresenter />
                            </section>
                        </div>
                    }
                />
                <Route
                    path="/about"
                    element={
                        <div className="flex h-screen w-full items-start justify-center overflow-y-auto bg-slate-50 p-8 pt-20">
                            <section className="overlay-panel w-full max-w-3xl">
                                <h2 className="overlay-panel-title">About</h2>
                                <p className="text-sm text-slate-600">
                                    Förseningskartan — a transit delay visualization tool.
                                </p>
                            </section>
                        </div>
                    }
                />
                <Route path="/login" element={<LoginPresenter />} />
                <Route path="/account" element={<AccountPresenter />} />
            </Routes>
        </div>
    );
}

export default App;
