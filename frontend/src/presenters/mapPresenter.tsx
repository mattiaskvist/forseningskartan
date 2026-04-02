import { useCallback } from "react";
import { MapView } from "../views/mapView";
import { useAppDispatch, useAppSelector } from "../store/store";
import {
    getSelectedSiteCB,
    getSitesCB,
    getSitesLoadingCB,
    getStopPointsCB,
    getStopPointsLoadingCB,
} from "../store/selectors";
import { selectSiteCB } from "../store/selection";
import { DeparturePresenter } from "./departurePresenter";
import { Suspense } from "../components/Suspense";

export function MapPresenter() {
    const dispatch = useAppDispatch();
    const selectedSite = useAppSelector(getSelectedSiteCB);
    const sites = useAppSelector(getSitesCB);
    const isSitesLoading = useAppSelector(getSitesLoadingCB);
    const stopPoints = useAppSelector(getStopPointsCB);
    const isStopPointsLoading = useAppSelector(getStopPointsLoadingCB);

    const handleSelectSiteCB = useCallback(
        (siteId: number | null) => {
            selectSiteCB({ dispatch, siteId });
        },
        [dispatch]
    );

    if (isSitesLoading || !sites || isStopPointsLoading || !stopPoints) {
        return <Suspense fullscreen message="Loading transit data and preparing the map..." />;
    }

    return (
        <>
            <MapView
                sites={sites}
                selectedSite={selectedSite}
                handleSelectSiteCB={handleSelectSiteCB}
            />
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
    );
}
