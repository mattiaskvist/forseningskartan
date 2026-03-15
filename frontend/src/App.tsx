import { useEffect } from "react";
import { MapPresenter } from "./presenters/mapPresenter";
import { getAggregatedDates, getSites, getStopPoints } from "./store/actions";
import { useAppDispatch } from "./store/store";
import { DeparturePresenter } from "./presenters/departurePresenter";
import { StopDelayPresenter } from "./presenters/stopDelayPresenter";
import { RouteDelayPresenter } from "./presenters/RouteDelayPresenter";

const OVERLAY_PANEL_CLASS =
    "rounded-md border border-slate-200/80 bg-white/95 p-3 shadow-lg backdrop-blur-sm";

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
                    <section className={OVERLAY_PANEL_CLASS}>
                        <h2 className="mb-2 text-sm font-semibold text-slate-800">Departures</h2>
                        <DeparturePresenter />
                    </section>
                    <section className={OVERLAY_PANEL_CLASS}>
                        <h2 className="mb-2 text-sm font-semibold text-slate-800">Stop delays</h2>
                        <StopDelayPresenter />
                    </section>
                    <section className={OVERLAY_PANEL_CLASS}>
                        <h2 className="mb-2 text-sm font-semibold text-slate-800">Route delays</h2>
                        <RouteDelayPresenter />
                    </section>
                </div>
            </aside>
        </div>
    );
}

export default App;
