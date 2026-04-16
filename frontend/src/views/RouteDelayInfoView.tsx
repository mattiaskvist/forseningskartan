type RouteDelayInfoViewProps = {
    selectedDateText: string;
    routesInfoText: string;
    isRouteDetailsOpen: boolean;
};

export function RouteDelayInfoView({
    selectedDateText,
    routesInfoText,
    isRouteDetailsOpen,
}: RouteDelayInfoViewProps) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            {selectedDateText}
            {!isRouteDetailsOpen ? <p>{routesInfoText}</p> : null}
        </div>
    );
}
