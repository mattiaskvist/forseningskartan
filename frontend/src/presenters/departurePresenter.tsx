import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/store";
import { DepartureView } from "../views/departureView";
import { getDeparturesCB, getDeparturesLoadingCB } from "../store/selectors";
import { setSelectedSiteId } from "../store/reducers";
import { Departure, Site } from "../types/sl";

type SelectedDepartureState = {
    siteId: number;
    departure: Departure;
};

type DeparturePresenterProps = {
    selectedSite: Site;
};

export function DeparturePresenter({ selectedSite }: DeparturePresenterProps) {
    const dispatch = useAppDispatch();
    const departureResponse = useAppSelector(getDeparturesCB);
    const isDeparturesLoading = useAppSelector(getDeparturesLoadingCB);
    const [selectedDepartureState, setSelectedDepartureState] = useState<SelectedDepartureState | null>(
        null
    );

    function selectDepartureCB(departure: Departure) {
        setSelectedDepartureState({ siteId: selectedSite.id, departure });
    }

    function returnToDepartureListCB() {
        setSelectedDepartureState(null);
    }

    function closeDeparturesViewCB() {
        setSelectedDepartureState(null);
        dispatch(setSelectedSiteId(null));
    }

    const departures = departureResponse?.departures ?? [];
    const selectedDeparture =
        selectedDepartureState !== null && selectedDepartureState.siteId === selectedSite.id
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
