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
        <div className="themed-text-muted flex flex-wrap items-center justify-between gap-2 text-xs">
            {selectedDateText}
            {!isRouteDetailsOpen ? <p>{routesInfoText}</p> : null}
        </div>
    );
}
