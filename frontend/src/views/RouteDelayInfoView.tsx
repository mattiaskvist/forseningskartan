import { getPresetDescription } from "../types/departureDelay";
import { RouteDelaySection } from "../types/routeDelays";

type RouteDelayInfoViewProps = {
    selectedDates: string[];
    selectedSection: RouteDelaySection;
    visibleRoutesCount: number;
    totalFilteredRoutes: number;
    isRouteDetailsOpen: boolean;
};

export function RouteDelayInfoView({
    selectedDates,
    selectedSection,
    visibleRoutesCount,
    totalFilteredRoutes,
    isRouteDetailsOpen,
}: RouteDelayInfoViewProps) {
    const selectedDateText = getPresetDescription(selectedDates);

    const routesInfoText =
        selectedSection === "routes"
            ? `Showing ${visibleRoutesCount} of ${totalFilteredRoutes} filtered routes`
            : `Showing ${totalFilteredRoutes} filtered routes`;

    return (
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            {selectedDateText}
            {!isRouteDetailsOpen ? <p>{routesInfoText}</p> : null}
        </div>
    );
}
