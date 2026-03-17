import { useEffect } from "react";
import { MapPresenter } from "./presenters/mapPresenter";
import { getAggregatedDates, getSites, getStopPoints } from "./store/actions";
import { useAppDispatch, useAppSelector } from "./store/store";
import { DeparturePresenter } from "./presenters/departurePresenter";
import { StopDelayPresenter } from "./presenters/stopDelayPresenter";
import { RouteDelayPresenter } from "./presenters/RouteDelayPresenter";
import { getSelectedSiteCB, getSitesLoadingCB, getSitesCB } from "./store/selectors";
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
    if (isSitesLoading || !sites) {
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
                        <h2 className="overlay-panel-title">Stop delays</h2>
                        <StopDelayPresenter />
                    </section>
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
