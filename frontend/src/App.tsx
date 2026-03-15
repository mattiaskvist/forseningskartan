import { useEffect } from "react";
import { MapPresenter } from "./presenters/mapPresenter";
import { getAggregatedDates, getSites, getStopPoints } from "./store/actions";
import { useAppDispatch } from "./store/store";
import { DeparturePresenter } from "./presenters/departurePresenter";
import { StopDelayPresenter } from "./presenters/stopDelayPresenter";
import { RouteDelayPresenter } from "./presenters/RouteDelayPresenter";

function App() {
    const dispatch = useAppDispatch();

    // Fetch sites on app load
    useEffect(() => {
        dispatch(getSites());
    }, [dispatch]);

    // Fetch stop points on app load
    useEffect(() => {
        dispatch(getStopPoints());
    }, [dispatch]);

    // Fetch aggregated dates on app load
    useEffect(() => {
        dispatch(getAggregatedDates());
    }, [dispatch]);

    return (
        <div className="relative h-screen w-screen overflow-hidden">
            <MapPresenter />
            <aside className="pointer-events-none absolute right-4 top-4 z-[1000] max-h-[calc(100vh-2rem)] w-[min(420px,calc(100vw-2rem))] overflow-y-auto">
                <div className="pointer-events-auto flex flex-col gap-3">
                    <section className="overlay-panel">
                        <h2 className="overlay-panel-title">Departures</h2>
                        <DeparturePresenter />
                    </section>
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
