import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/store";
import { DepartureView } from "../views/departureView";
import { getDeparturesCB, getDeparturesLoadingCB, getSelectedSiteCB } from "../store/selectors";
import { setSelectedSiteId } from "../store/reducers";
import { Departure } from "../types/sl";

export function DeparturePresenter() {
    const dispatch = useAppDispatch();
    const departureResponse = useAppSelector(getDeparturesCB);
    const isDeparturesLoading = useAppSelector(getDeparturesLoadingCB);
    const selectedSite = useAppSelector(getSelectedSiteCB);
    const [selectedDepartureKey, setSelectedDepartureKey] = useState<string | null>(null);
    const selectedSiteId = selectedSite?.id ?? null;

    function getDepartureKeyCB(departure: Departure) {
        return `${selectedSiteId ?? "no-site"}-${departure.journey.id}-${departure.scheduled}-${departure.stop_point.id}`;
    }

    function selectDepartureCB(departure: Departure) {
        setSelectedDepartureKey(getDepartureKeyCB(departure));
    }

    function returnToDepartureListCB() {
        setSelectedDepartureKey(null);
    }

    function closeDeparturesViewCB() {
        setSelectedDepartureKey(null);
        dispatch(setSelectedSiteId(null));
    }

    if (!selectedSite) {
        return null;
    }

    const departures = departureResponse?.departures ?? [];
    const selectedDeparture =
        selectedDepartureKey !== null
            ? departures.find((departure) => getDepartureKeyCB(departure) === selectedDepartureKey) ?? null
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
