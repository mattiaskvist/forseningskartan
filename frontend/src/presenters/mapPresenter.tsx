import { MapView } from "../views/mapView";
import { getDepartures } from "../store/actions";
import { setSelectedSiteId } from "../store/reducers";
import { RootState, useAppDispatch, useAppSelector } from "../store/store";

export function MapPresenter() {
    const dispatch = useAppDispatch();

    function getSitesCB(state: RootState) {
        return state.sites.data;
    }

    function getSelectedSiteIdCB(state: RootState) {
        return state.sites.selectedSiteId;
    }

    function getStopPointsCB(state: RootState) {
        return state.stopPoints.data;
    }

    const sites = useAppSelector(getSitesCB);
    const selectedSiteId = useAppSelector(getSelectedSiteIdCB);
    const stopPoints = useAppSelector(getStopPointsCB);

    function handleSelectSiteCB(siteId: number) {
        dispatch(setSelectedSiteId(siteId));
        dispatch(getDepartures(siteId));
    }

    return sites ? (
        <MapView
            sites={sites}
            stopPoints={stopPoints ?? []}
            selectedSiteId={selectedSiteId}
            handleSelectSiteCB={handleSelectSiteCB}
        />
    ) : (
        <div>TODO SUSPENSE...</div>
    );
}
