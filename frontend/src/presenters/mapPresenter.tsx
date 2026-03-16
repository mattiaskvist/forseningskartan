import { useCallback } from "react";
import { MapView } from "../views/mapView";
import { Suspense } from "../components/Suspense";
import { useAppDispatch, useAppSelector } from "../store/store";
import { getSitesCB, getSelectedSiteCB } from "../store/selectors";
import { selectSiteCB } from "../store/selection";

export function MapPresenter() {
    const dispatch = useAppDispatch();

    const sites = useAppSelector(getSitesCB);
    const selectedSite = useAppSelector(getSelectedSiteCB);

    const handleSelectSiteCB = useCallback(
        (siteId: number | null) => {
            selectSiteCB({ dispatch, siteId });
        },
        [dispatch]
    );

    return sites ? (
        <MapView
            sites={sites}
            selectedSite={selectedSite}
            handleSelectSiteCB={handleSelectSiteCB}
        />
    ) : (
        <Suspense fullscreen message="Loading stops and preparing the map..." />
    );
}
