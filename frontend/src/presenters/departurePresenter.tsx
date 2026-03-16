import { useAppDispatch, useAppSelector } from "../store/store";
import { DepartureView } from "../views/departureView";
import { getDeparturesCB, getDeparturesLoadingCB, getSelectedSiteCB } from "../store/selectors";
import { setSelectedSiteId } from "../store/reducers";

export function DeparturePresenter() {
    const dispatch = useAppDispatch();
    const departureResponse = useAppSelector(getDeparturesCB);
    const isDeparturesLoading = useAppSelector(getDeparturesLoadingCB);
    const selectedSite = useAppSelector(getSelectedSiteCB);

    function closeDeparturesViewCB() {
        dispatch(setSelectedSiteId(null));
    }

    if (!selectedSite) {
        return null;
    }

    return (
        <DepartureView
            departures={departureResponse?.departures ?? []}
            selectedSiteName={selectedSite.name}
            onCloseCB={closeDeparturesViewCB}
            isLoading={isDeparturesLoading}
        />
    );
}
