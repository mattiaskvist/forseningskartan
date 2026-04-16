import { useCallback } from "react";
import { MapView } from "../views/mapView";
import { useAppDispatch, useAppSelector } from "../store/store";
import {
    getAggregatedDatesCB,
    getAuthUserCB,
    getDepartureHistoricalDelayLoadingCB,
    getDepartureHistoricalDelaySummaryCB,
    getDeparturesCB,
    getDeparturesLoadingCB,
    getFavoriteSiteIdsCB,
    getMapStylePreferenceCB,
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
import { setMapStylePreference, toggleFavoriteSiteId } from "../store/userPreferencesSlice";
import { MapStyle } from "../types/map";
import { showSnackbar } from "../store/snackbarSlice";

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
    const user = useAppSelector(getAuthUserCB);
    const favoriteSiteIds = useAppSelector(getFavoriteSiteIdsCB);
    const mapStyle = useAppSelector(getMapStylePreferenceCB);

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

    function setMapStyleACB(style: MapStyle) {
        dispatch(setMapStylePreference(style));
    }

    function toggleFavoriteStopACB() {
        if (!selectedSite) {
            return;
        }

        if (!user) {
            dispatch(
                showSnackbar({
                    message: "Log in to save favorite stops.",
                    severity: "info",
                })
            );
            return;
        }

        const isFavorite = favoriteSiteIds.includes(selectedSite.id);
        dispatch(toggleFavoriteSiteId(selectedSite.id));
        dispatch(
            showSnackbar({
                message: isFavorite ? "Removed stop from favorites." : "Added stop to favorites.",
                severity: "success",
            })
        );
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
              isFavoriteStop: favoriteSiteIds.includes(selectedSite.id),
              isUserLoggedIn: Boolean(user),
              onToggleFavoriteStop: toggleFavoriteStopACB,
          }
        : null;

    return (
        <MapView
            sites={sites}
            selectedSite={selectedSite}
            handleSelectSiteCB={handleSelectSiteCB}
            departureViewProps={departureViewProps}
            mapStyle={mapStyle}
            onMapStyleChange={setMapStyleACB}
        />
    );
}
