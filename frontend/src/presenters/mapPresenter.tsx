import { useCallback } from "react";
import { MapView } from "../views/mapView";
import { useAppDispatch, useAppSelector } from "../store/store";
import { getSelectedSiteCB } from "../store/selectors";
import { selectSiteCB } from "../store/selection";
import { Site } from "../types/sl";

type MapPresenterProps = {
    sites: Site[];
};

export function MapPresenter({ sites }: MapPresenterProps) {
    const dispatch = useAppDispatch();
    const selectedSite = useAppSelector(getSelectedSiteCB);

    const handleSelectSiteCB = useCallback(
        (siteId: number | null) => {
            selectSiteCB({ dispatch, siteId });
        },
        [dispatch]
    );

    return (
        <MapView
            sites={sites}
            selectedSite={selectedSite}
            handleSelectSiteCB={handleSelectSiteCB}
        />
    );
}
