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

    function closeDeparturesViewCB() {
        dispatch(setSelectedDeparture(null));
        dispatch(setSelectedSiteId(null));
    }

    function selectDepartureCB(departure: Departure) {
        dispatch(setSelectedDeparture(departure));
    }

    function returnToDepartureListCB() {
        dispatch(setSelectedDeparture(null));
    }

    function setSelectedDatePresetCB(preset: DatePreset) {
        dispatch(setSelectedDatePreset(preset));
    }

    function setSelectedCustomDateCB(date: string) {
        dispatch(setSelectedCustomDate(date));
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
            availableDates={availableDates}
            selectedDelayDates={selectedDelayDates}
            selectedDepartureDelaySummary={selectedDepartureDelaySummary}
            isDepartureHistoricalDelayLoading={isDepartureHistoricalDelayLoading}
            selectedDatePreset={selectedDatePreset}
            selectedCustomDate={selectedCustomDate}
            onDatePresetChangeCB={setSelectedDatePresetCB}
            onCustomDateChangeCB={setSelectedCustomDateCB}
        />
    );
}
