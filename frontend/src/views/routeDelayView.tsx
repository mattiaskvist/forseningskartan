import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Pagination from "@mui/material/Pagination";
import Select from "@mui/material/Select";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import type { SelectChangeEvent } from "@mui/material/Select";
import { DelaySummary } from "../types/historicalDelay";
import { RouteDelayControls } from "../components/RouteDelayControls";
import { RouteDetailsPage } from "../components/RouteDetailsPage";
import { DatePreset, EventType, getPresetDescription } from "../types/departureDelay";
import { TransportationMode } from "../types/sl";
import {
    PageSizeOption,
    PageSizeOptions,
    RouteDelaySection,
    RouteDelayTrendPoint,
} from "../types/routeDelays";
import { getAvgDelayMinutes } from "../utils/time";
import { getRouteDisplayName } from "../utils/route";

type RouteDelayViewProps = {
    selectedSection: RouteDelaySection;
    selectedDates: string[];
    selectedDatePreset: DatePreset;
    selectedCustomDate: string | null;
    selectedEventType: EventType;
    selectedTransportationMode: TransportationMode;
    searchQuery: string;
    pagedRoutes: DelaySummary[];
    currentPage: number;
    totalPages: number;
    totalFilteredRoutes: number;
    routesPerPage: number;
    selectedRouteKey: string | null;
    selectedRouteSummary: DelaySummary | null;
    leaderboardItems: DelaySummary[];
    trendPoints: RouteDelayTrendPoint[];
    isTrendLoading: boolean;
    transportationModeOptions: TransportationMode[];
    availableDates: string[];
    onDatePresetChangeCB: (preset: DatePreset) => void;
    onCustomDateChangeCB: (date: string) => void;
    onEventTypeChangeCB: (eventType: EventType) => void;
    onTransportationModeChangeCB: (filter: TransportationMode) => void;
    onSearchQueryChangeCB: (query: string) => void;
    onSelectedSectionChangeCB: (section: RouteDelaySection) => void;
    onSelectRouteCB: (routeKey: string | null) => void;
    onPageChangeCB: (nextPage: number) => void;
    onRoutesPerPageChangeCB: (nextPageSize: PageSizeOption) => void;
};

export function RouteDelayView({
    selectedSection,
    selectedDates,
    selectedDatePreset,
    selectedCustomDate,
    selectedEventType,
    selectedTransportationMode,
    searchQuery,
    pagedRoutes,
    currentPage,
    totalPages,
    totalFilteredRoutes,
    routesPerPage,
    selectedRouteKey,
    selectedRouteSummary,
    leaderboardItems,
    trendPoints,
    isTrendLoading,
    transportationModeOptions,
    availableDates,
    onDatePresetChangeCB,
    onCustomDateChangeCB,
    onEventTypeChangeCB,
    onTransportationModeChangeCB,
    onSearchQueryChangeCB,
    onSelectedSectionChangeCB,
    onSelectRouteCB,
    onPageChangeCB,
    onRoutesPerPageChangeCB,
}: RouteDelayViewProps) {
    const isRouteDetailsOpen = selectedRouteKey !== null;

    const selectedDateText = getPresetDescription(selectedDates, 0);

    const routesInfoText =
        selectedSection === "routes"
            ? `Showing ${pagedRoutes.length} of ${totalFilteredRoutes} filtered routes`
            : `Showing ${totalFilteredRoutes} filtered routes`;

    function getRouteListItemCB(summary: DelaySummary) {
        const routeKey = summary.key;
        const avgDelayMinutes = getAvgDelayMinutes(summary, selectedEventType);

        function handleClickCB() {
            onSelectRouteCB(routeKey);
        }

        return (
            <li key={routeKey}>
                <button
                    type="button"
                    className={`w-full rounded border p-2 text-left transition 
                        border-slate-200 hover:border-slate-300 hover:bg-slate-50
                        flex items-center justify-between`}
                    onClick={handleClickCB}
                >
                    <div>
                        <p className="text-sm font-semibold text-slate-900">
                            {summary.route?.shortName} {summary.route?.longName}
                        </p>
                        <p className="text-xs text-slate-600">
                            Avg delay: {avgDelayMinutes} min, {summary.uniqueTrips} unique trips
                        </p>
                    </div>
                    <ArrowForwardIosIcon className="mr-2" />
                </button>
            </li>
        );
    }

    function getLeaderboardItemCB(summary: DelaySummary, index: number) {
        const avgDelayMinutes = getAvgDelayMinutes(summary, selectedEventType);
        return (
            <li
                key={summary.key}
                className="flex items-center justify-between text-sm text-slate-700"
            >
                <span className="flex items-center gap-3">
                    <span className="w-6 text-right font-semibold text-slate-500 tabular-nums">
                        {index + 1}.
                    </span>
                    <span>{getRouteDisplayName(summary)}</span>
                </span>
                <span className="flex font-medium tabular-nums">
                    <span className="text-right">{avgDelayMinutes} min</span>
                    <span className="w-36 text-right">{summary.uniqueTrips} unique trips</span>
                </span>
            </li>
        );
    }

    function getRoutesPerPageOptionCB(pageSize: number) {
        return (
            <MenuItem key={pageSize} value={pageSize}>
                {pageSize} / page
            </MenuItem>
        );
    }

    function handleRoutesPerPageChangeCB(event: SelectChangeEvent<number>) {
        onRoutesPerPageChangeCB(event.target.value as PageSizeOption);
    }

    function handlePaginationChangeCB(_: React.ChangeEvent<unknown>, nextPage: number) {
        onPageChangeCB(nextPage);
    }

    function handleSectionChangeCB(
        _: React.MouseEvent<HTMLElement>,
        nextSection: RouteDelaySection | null
    ) {
        if (nextSection) {
            onSelectedSectionChangeCB(nextSection);
        }
    }

    return (
        <div className="flex w-full flex-col gap-4">
            <div className="space-y-4">
                <ToggleButtonGroup
                    exclusive
                    fullWidth
                    value={selectedSection}
                    onChange={handleSectionChangeCB}
                >
                    <ToggleButton value="routes" sx={{ fontWeight: 600 }}>
                        Routes
                    </ToggleButton>
                    <ToggleButton value="leaderboard" sx={{ fontWeight: 600 }}>
                        Delay Leaderboard
                    </ToggleButton>
                </ToggleButtonGroup>

                <RouteDelayControls
                    selectedSection={selectedSection}
                    isRouteDetailsOpen={isRouteDetailsOpen}
                    availableDates={availableDates}
                    selectedDatePreset={selectedDatePreset}
                    selectedCustomDate={selectedCustomDate}
                    selectedEventType={selectedEventType}
                    selectedTransportationMode={selectedTransportationMode}
                    searchQuery={searchQuery}
                    transportationModeOptions={transportationModeOptions}
                    onDatePresetChangeCB={onDatePresetChangeCB}
                    onCustomDateChangeCB={onCustomDateChangeCB}
                    onEventTypeChangeCB={onEventTypeChangeCB}
                    onTransportationModeChangeCB={onTransportationModeChangeCB}
                    onSearchQueryChangeCB={onSearchQueryChangeCB}
                />

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                    {selectedDateText}
                    {!isRouteDetailsOpen ? <p>{routesInfoText}</p> : null}
                </div>
            </div>

            <div>
                {selectedRouteKey === null ? (
                    <div className="flex flex-col gap-4 pt-4">
                        {selectedSection === "routes" ? (
                            <section className="space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <FormControl size="small" sx={{ minWidth: 125 }}>
                                        <InputLabel id="routes-per-page-label">Rows</InputLabel>
                                        <Select
                                            labelId="routes-per-page-label"
                                            label="Rows"
                                            value={routesPerPage}
                                            onChange={handleRoutesPerPageChangeCB}
                                        >
                                            {PageSizeOptions.map(getRoutesPerPageOptionCB)}
                                        </Select>
                                    </FormControl>

                                    {totalPages > 1 ? (
                                        <Pagination
                                            count={totalPages}
                                            page={currentPage}
                                            onChange={handlePaginationChangeCB}
                                            color="primary"
                                            shape="rounded"
                                            size="small"
                                            siblingCount={1}
                                            boundaryCount={1}
                                        />
                                    ) : null}
                                </div>

                                {pagedRoutes.length === 0 ? (
                                    <p className="rounded border border-slate-200 p-3 text-sm text-slate-500">
                                        No routes match the selected filters.
                                    </p>
                                ) : (
                                    <ul className="space-y-2">
                                        {pagedRoutes.map(getRouteListItemCB)}
                                    </ul>
                                )}
                            </section>
                        ) : null}

                        {selectedSection === "leaderboard" ? (
                            <section className="space-y-2">
                                {leaderboardItems.length === 0 ? (
                                    <p className="rounded border border-slate-200 p-3 text-sm text-slate-500">
                                        No leaderboard data available.
                                    </p>
                                ) : (
                                    <ol className="space-y-1 rounded border border-slate-200 p-3">
                                        {leaderboardItems.map(getLeaderboardItemCB)}
                                    </ol>
                                )}
                            </section>
                        ) : null}
                    </div>
                ) : (
                    selectedRouteSummary && (
                        <RouteDetailsPage
                            routeSummary={selectedRouteSummary}
                            selectedEventType={selectedEventType}
                            trendPoints={trendPoints}
                            isTrendLoading={isTrendLoading}
                            onBackCB={() => onSelectRouteCB(null)}
                        />
                    )
                )}
            </div>
        </div>
    );
}
