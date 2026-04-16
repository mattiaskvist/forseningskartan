type RouteDelayRouteFallbackViewProps = {
    onBackToRoutes: () => void;
};

export function RouteDelayRouteFallbackView({ onBackToRoutes }: RouteDelayRouteFallbackViewProps) {
    return (
        <div className="space-y-3 rounded border border-slate-200 p-4 text-sm text-slate-700">
            <p>The selected route is no longer available for the current filters.</p>
            <button
                type="button"
                className="rounded border border-slate-300 p-2 font-medium transition hover:bg-slate-50"
                onClick={onBackToRoutes}
            >
                Back to routes
            </button>
        </div>
    );
}
