import { MapView } from "../views/mapView";
import { RootState, useAppSelector } from "../store/store";

export function MapPresenter() {
    function getSitesCB(state: RootState) {
        return state.sites.data;
    }

    const sites = useAppSelector(getSitesCB);
    return sites ? <MapView sites={sites} /> : <div>TODO SUSPENSE...</div>;
}
