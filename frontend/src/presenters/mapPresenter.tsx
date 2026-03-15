import { MapView } from "../views/mapView";
import { useAppDispatch, useAppSelector } from "../store/store";
import { getSitesCB, getSelectedSiteCB } from "../store/selectors";
import { selectSiteCB } from "../store/selection";

export function MapPresenter() {
    const dispatch = useAppDispatch();

    const sites = useAppSelector(getSitesCB);
    const selectedSite = useAppSelector(getSelectedSiteCB);

    function handleSelectSiteCB(siteId: number | null) {
        selectSiteCB({ dispatch, siteId });
    }

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
