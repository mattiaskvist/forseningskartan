import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/store";
import { DepartureView } from "../views/departureView";
import { getDeparturesCB, getDeparturesLoadingCB } from "../store/selectors";
import { setSelectedSiteId } from "../store/reducers";
import { Departure, Site } from "../types/sl";

type DeparturePresenterProps = {
    selectedSite: Site;
};

export function DeparturePresenter({ selectedSite }: DeparturePresenterProps) {
    const dispatch = useAppDispatch();
    const departureResponse = useAppSelector(getDeparturesCB);
    const isDeparturesLoading = useAppSelector(getDeparturesLoadingCB);
    const [selectedDeparture, setSelectedDeparture] = useState<Departure | null>(null);

    function selectDepartureCB(departure: Departure) {
        setSelectedDeparture(departure);
    }

    function returnToDepartureListCB() {
        setSelectedDeparture(null);
    }

    function closeDeparturesViewCB() {
        setSelectedDeparture(null);
        dispatch(setSelectedSiteId(null));
    }

    const departures = departureResponse?.departures ?? [];

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
