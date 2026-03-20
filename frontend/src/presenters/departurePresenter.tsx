import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/store";
import { DepartureView } from "../views/departureView";
import {
    getDeparturesCB,
    getDeparturesLoadingCB,
    getAggregatedDatesCB,
    getStopDelaysCB,
    getStopDelaysLoadingCB,
} from "../store/selectors";
import { setSelectedSiteId } from "../store/reducers";
import { getStopDelays } from "../store/actions";
import { Departure, Site, StopPoint } from "../types/sl";
import { getStopDelayRequestKey } from "../types/stopDelay";
import { DelaySummary } from "../types/historicalDelay";
import { getStopPointGidsForSite } from "../utils/site";
import { aggregateStopSummariesCB } from "../utils/delayAggregation";
import { DatePreset } from "../types/departureDelay";
import { sortDatesDescendingCB, getDatesForPreset } from "../utils/time";

type DeparturePresenterProps = {
    selectedSite: Site;
    stopPoints: StopPoint[];
};

export function DeparturePresenter({ selectedSite, stopPoints }: DeparturePresenterProps) {
    const dispatch = useAppDispatch();
    const departureResponse = useAppSelector(getDeparturesCB);
    const isDeparturesLoading = useAppSelector(getDeparturesLoadingCB);

    const availableDates = useAppSelector(getAggregatedDatesCB);

    const [selectedDeparture, setSelectedDeparture] = useState<Departure | null>(null);
    const [selectedDatePreset, setSelectedDatePreset] = useState<DatePreset>("sameDayLastWeek");
    const [selectedCustomDate, setSelectedCustomDate] = useState<string | null>(null);

    const stopDelaysCache = useAppSelector(getStopDelaysCB);
    const isStopDelaysLoading = useAppSelector(getStopDelaysLoadingCB);
    const selectedStopPointGIDs = useMemo(
        () => getStopPointGidsForSite(selectedSite, stopPoints),
        [selectedSite, stopPoints]
    );

    const selectedDelayDates = useMemo(() => {
        if (!selectedDeparture) {
            return [];
        }

        const latestDate = [...availableDates].sort(sortDatesDescendingCB)[0];
        const effectiveCustomDate = selectedCustomDate ?? latestDate ?? null;

        return getDatesForPreset(selectedDatePreset, effectiveCustomDate, availableDates);
    }, [selectedDeparture, selectedDatePreset, selectedCustomDate, availableDates]);

    // fetch data for selected departure and dates if not in cache
    useEffect(() => {
        function getDelaysForDateCB(date: string) {
            function isStopDelayMissingCB(stopPointGID: string): boolean {
                const requestKey = getStopDelayRequestKey(stopPointGID, date);
                const cacheEntry = stopDelaysCache[requestKey];

                if (!cacheEntry) {
                    return true;
                }
                if (cacheEntry.status === "loading" || cacheEntry.status === "succeeded") {
                    return false;
                }
                return true;
            }

            const missingStopPointGIDs = selectedStopPointGIDs.filter(isStopDelayMissingCB);
            dispatch(getStopDelays({ stopPointGIDs: missingStopPointGIDs, date }));
        }

        selectedDelayDates.forEach(getDelaysForDateCB);
    }, [dispatch, selectedStopPointGIDs, selectedDelayDates, stopDelaysCache]);

    // aggregate stop summaries for selected dates
    const selectedStopDelays: DelaySummary[] = useMemo(() => {
        const result: DelaySummary[] = [];

        function addStopSummaryForDateCB(date: string) {
            const summariesForDate: DelaySummary[] = [];

            selectedStopPointGIDs.forEach((stopPointGID) => {
                const requestKey = getStopDelayRequestKey(stopPointGID, date);
                const cacheEntry = stopDelaysCache[requestKey];

                if (cacheEntry?.status === "succeeded" && cacheEntry.data) {
                    summariesForDate.push(cacheEntry.data);
                }
            });

            const summary = aggregateStopSummariesCB(summariesForDate);
            if (summary) {
                result.push(summary);
            }
        }

        selectedDelayDates.forEach(addStopSummaryForDateCB);
        return result;
    }, [selectedStopPointGIDs, selectedDelayDates, stopDelaysCache]);

    const setSelectedDatePresetCB = useCallback((preset: DatePreset) => {
        setSelectedDatePreset(preset);
    }, []);

    const setSelectedCustomDateCB = useCallback((date: string) => {
        setSelectedCustomDate(date);
    }, []);

    const resetDepartureSelectionCB = useCallback(() => {
        setSelectedDeparture(null);
        setSelectedDatePreset("sameDayLastWeek");
        setSelectedCustomDate(null);
    }, []);

    // reset departure selection when selected site changes
    // can change though close button, map or search bar
    useEffect(() => {
        resetDepartureSelectionCB();
    }, [selectedSite.id, resetDepartureSelectionCB]);

    function selectDepartureCB(departure: Departure) {
        setSelectedDeparture(departure);
        setSelectedDatePreset("sameDayLastWeek");
        setSelectedCustomDate(null);
    }

    function returnToDepartureListCB() {
        resetDepartureSelectionCB();
    }

    function closeDeparturesViewCB() {
        resetDepartureSelectionCB();
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
            availableDates={availableDates}
            selectedDelayDates={selectedDelayDates}
            selectedStopDelays={selectedStopDelays}
            isStopDelaysLoading={isStopDelaysLoading}
            selectedDatePreset={selectedDatePreset}
            selectedCustomDate={selectedCustomDate}
            onDatePresetChangeCB={setSelectedDatePresetCB}
            onCustomDateChangeCB={setSelectedCustomDateCB}
        />
    );
}
