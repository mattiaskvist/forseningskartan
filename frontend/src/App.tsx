import { useEffect } from "react";
import { MapPresenter } from "./presenters/mapPresenter";
import { getAggregatedDates, getSites, getStopPoints } from "./store/actions";
import { useAppDispatch, useAppSelector } from "./store/store";
import { DeparturePresenter } from "./presenters/departurePresenter";
import { RouteDelayPresenter } from "./presenters/RouteDelayPresenter";
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
            <MapPresenter sites={sites} />
            <aside className="pointer-events-auto absolute right-4 top-4 z-1000 w-[min(420px,calc(100vw-2rem))]">
                <div className="flex max-h-[calc(100vh-2rem)] flex-col gap-3 overflow-y-auto pr-1">
                    {selectedSite && (
                        <section className="overlay-panel">
                            <h2 className="overlay-panel-title">Departures</h2>
                            <DeparturePresenter selectedSite={selectedSite} />
                        </section>
                    )}
                    <section className="overlay-panel">
                        <h2 className="overlay-panel-title">Route delays</h2>
                        <RouteDelayPresenter />
                    </section>
                </div>
            </aside>
        </div>
    );
}

export default App;
