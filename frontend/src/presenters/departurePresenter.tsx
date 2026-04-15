import { useAppDispatch, useAppSelector } from "../store/store";
import { DepartureView } from "../views/departureView";
import {
    getDeparturesCB,
    getDeparturesLoadingCB,
    getAggregatedDatesCB,
    getDepartureHistoricalDelayLoadingCB,
    getDepartureHistoricalDelaySummaryCB,
    getSelectedCustomDateCB,
    getSelectedDatePresetCB,
    getSelectedDelayDatesCB,
    getSelectedDepartureCB,
} from "../store/selectors";
import {
    setSelectedCustomDate,
    setSelectedDatePreset,
    setSelectedDeparture,
    setSelectedSiteId,
} from "../store/reducers";
import { Departure, Site } from "../types/sl";
import { DatePreset } from "../types/departureDelay";

type DeparturePresenterProps = {
    selectedSite: Site;
};

export function DeparturePresenter({ selectedSite }: DeparturePresenterProps) {
    const dispatch = useAppDispatch();
    const departureResponse = useAppSelector(getDeparturesCB);
    const isDeparturesLoading = useAppSelector(getDeparturesLoadingCB);

    const availableDates = useAppSelector(getAggregatedDatesCB);
    const selectedDeparture = useAppSelector(getSelectedDepartureCB);
    const selectedDatePreset = useAppSelector(getSelectedDatePresetCB);
    const selectedCustomDate = useAppSelector(getSelectedCustomDateCB);
    const selectedDelayDates = useAppSelector(getSelectedDelayDatesCB);
    const selectedDepartureDelaySummary = useAppSelector(getDepartureHistoricalDelaySummaryCB);
    const isDepartureHistoricalDelayLoading = useAppSelector(getDepartureHistoricalDelayLoadingCB);

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

    return (
        <DepartureView
            departures={departures}
            selectedDeparture={selectedDeparture}
            selectedSiteName={selectedSite.name}
            onClose={closeDeparturesViewACB}
            onSelectDeparture={selectDepartureACB}
            onBackToList={returnToDepartureListACB}
            isLoading={isDeparturesLoading}
            availableDates={availableDates}
            selectedDelayDates={selectedDelayDates}
            selectedDepartureDelaySummary={selectedDepartureDelaySummary}
            isDepartureHistoricalDelayLoading={isDepartureHistoricalDelayLoading}
            selectedDatePreset={selectedDatePreset}
            selectedCustomDate={selectedCustomDate}
            onDatePresetChange={setSelectedDatePresetACB}
            onCustomDateChange={setSelectedCustomDateACB}
        />
    );
}
