import { useCallback } from "react";
import { MapView } from "../views/mapView";
import { useAppDispatch, useAppSelector } from "../store/store";
import { getSitesCB, getSelectedSiteCB } from "../store/selectors";
import { selectSiteCB } from "../store/selection";

export function MapPresenter() {
    const dispatch = useAppDispatch();

    const sites = useAppSelector(getSitesCB);
    const selectedSite = useAppSelector(getSelectedSiteCB);

    const handleSelectSiteCB = useCallback((siteId: number | null) => {
        selectSiteCB({ dispatch, siteId });
    }, [dispatch]);

    return sites ? (
        <MapView
            sites={sites}
            selectedSite={selectedSite}
            handleSelectSiteCB={handleSelectSiteCB}
        />
    ) : (
        <div>TODO SUSPENSE...</div>
    );
}
