import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/store";
import { DepartureView } from "../views/departureView";
import {
    getDeparturesCB,
    getDeparturesLoadingCB,
    getSelectedSiteCB,
    getSelectedSiteIdCB,
} from "../store/selectors";
import { setSelectedSiteId } from "../store/reducers";
import { Departure } from "../types/sl";

type SelectedDepartureState = {
    siteId: number;
    departure: Departure;
};

export function DeparturePresenter() {
    const dispatch = useAppDispatch();
    const departureResponse = useAppSelector(getDeparturesCB);
    const isDeparturesLoading = useAppSelector(getDeparturesLoadingCB);
    const selectedSite = useAppSelector(getSelectedSiteCB);
    const selectedSiteId = useAppSelector(getSelectedSiteIdCB);
    const [selectedDepartureState, setSelectedDepartureState] = useState<SelectedDepartureState | null>(
        null
    );

    function selectDepartureCB(departure: Departure) {
        if (selectedSiteId === null) {
            return;
        }

        setSelectedDepartureState({ siteId: selectedSiteId, departure });
    }

    function returnToDepartureListCB() {
        setSelectedDepartureState(null);
    }

    function closeDeparturesViewCB() {
        setSelectedDepartureState(null);
        dispatch(setSelectedSiteId(null));
    }

    if (!selectedSite) {
        return null;
    }

    const departures = departureResponse?.departures ?? [];
    const selectedDeparture =
        selectedSiteId !== null &&
        selectedDepartureState !== null &&
        selectedDepartureState.siteId === selectedSiteId
            ? selectedDepartureState.departure
            : null;

    return (
        <DepartureView
            departures={departures}
            selectedDeparture={selectedDeparture}
            selectedSiteName={selectedSite.name}
            onCloseCB={closeDeparturesViewCB}
            onSelectDepartureCB={selectDepartureCB}
            onBackToListCB={returnToDepartureListCB}
            isLoading={isDeparturesLoading}
        />
    );
}
