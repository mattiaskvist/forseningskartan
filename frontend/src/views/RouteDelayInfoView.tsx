import { getPresetDescription } from "../types/departureDelay";
import { DelaySummary } from "../types/historicalDelay";
import { RouteDelaySection } from "../types/routeDelays";

type RouteDelayInfoViewProps = {
    selectedDates: string[];
    selectedSection: RouteDelaySection;
    pagedRoutes: DelaySummary[];
    totalFilteredRoutes: number;
    isRouteDetailsOpen: boolean;
};

export function RouteDelayInfoView({
    selectedDates,
    selectedSection,
    pagedRoutes,
    totalFilteredRoutes,
    isRouteDetailsOpen,
}: RouteDelayInfoViewProps) {
    const selectedDateText = getPresetDescription(selectedDates, 0);

    const routesInfoText =
        selectedSection === "routes"
            ? `Showing ${pagedRoutes.length} of ${totalFilteredRoutes} filtered routes`
            : `Showing ${totalFilteredRoutes} filtered routes`;

    return (
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            {selectedDateText}
            {!isRouteDetailsOpen ? <p>{routesInfoText}</p> : null}
        </div>
    );
}
