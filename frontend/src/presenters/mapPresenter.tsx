import { useCallback } from "react";
import { MapView } from "../views/mapView";
import { useAppDispatch, useAppSelector } from "../store/store";
import {
    getAggregatedDatesCB,
    getDepartureHistoricalDelayLoadingCB,
    getDepartureHistoricalDelaySummaryCB,
    getDeparturesCB,
    getDeparturesLoadingCB,
    getSelectedCustomDateCB,
    getSelectedDatePresetCB,
    getSelectedDelayDatesCB,
    getSelectedDepartureCB,
    getSelectedSiteCB,
} from "../store/selectors";
import { selectSiteCB } from "../store/selection";
import {
    setSelectedCustomDate,
    setSelectedDatePreset,
    setSelectedDeparture,
    setSelectedSiteId,
} from "../store/reducers";
import { Departure, Site } from "../types/sl";
import { DatePreset } from "../types/departureDelay";
import { DepartureViewProps } from "../views/departureView";

type MapPresenterProps = {
    sites: Site[];
};

export function MapPresenter({ sites }: MapPresenterProps) {
    const dispatch = useAppDispatch();
    const selectedSite = useAppSelector(getSelectedSiteCB);
    const departureResponse = useAppSelector(getDeparturesCB);
    const isDeparturesLoading = useAppSelector(getDeparturesLoadingCB);
    const availableDates = useAppSelector(getAggregatedDatesCB);
    const selectedDeparture = useAppSelector(getSelectedDepartureCB);
    const selectedDatePreset = useAppSelector(getSelectedDatePresetCB);
    const selectedCustomDate = useAppSelector(getSelectedCustomDateCB);
    const selectedDelayDates = useAppSelector(getSelectedDelayDatesCB);
    const selectedDepartureDelaySummary = useAppSelector(getDepartureHistoricalDelaySummaryCB);
    const isDepartureHistoricalDelayLoading = useAppSelector(getDepartureHistoricalDelayLoadingCB);

    const handleSelectSiteCB = useCallback(
        (siteId: number | null) => {
            selectSiteCB({ dispatch, siteId });
        },
        [dispatch]
    );

    function closeDeparturesViewACB() {
        dispatch(setSelectedDeparture(null));
        dispatch(setSelectedSiteId(null));
    }

    function selectDepartureACB(departure: Departure) {
        dispatch(setSelectedDeparture(departure));
    }

    function returnToDepartureListACB() {
        dispatch(setSelectedDeparture(null));
    }

    function setSelectedDatePresetACB(preset: DatePreset) {
        dispatch(setSelectedDatePreset(preset));
    }

    function setSelectedCustomDateACB(date: string) {
        dispatch(setSelectedCustomDate(date));
    }

    const departures = departureResponse?.departures ?? [];
    const departureViewProps: DepartureViewProps | null = selectedSite
        ? {
              departures,
              selectedDeparture,
              selectedSiteName: selectedSite.name,
              onClose: closeDeparturesViewACB,
              onSelectDeparture: selectDepartureACB,
              onBackToList: returnToDepartureListACB,
              isLoading: isDeparturesLoading,
              availableDates,
              selectedDelayDates,
              selectedDepartureDelaySummary,
              isDepartureHistoricalDelayLoading,
              selectedDatePreset,
              selectedCustomDate,
              onDatePresetChange: setSelectedDatePresetACB,
              onCustomDateChange: setSelectedCustomDateACB,
          }
        : null;

    return (
        <MapView
            sites={sites}
            selectedSite={selectedSite}
            handleSelectSiteCB={handleSelectSiteCB}
            departureViewProps={departureViewProps}
        />
    );
}
