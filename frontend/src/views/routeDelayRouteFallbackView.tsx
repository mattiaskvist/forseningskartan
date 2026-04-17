type RouteDelayRouteFallbackViewProps = {
    onBackToRoutes: () => void;
};

export function RouteDelayRouteFallbackView({ onBackToRoutes }: RouteDelayRouteFallbackViewProps) {
    return (
        <div className="themed-divider themed-text space-y-3 rounded border p-4 text-sm">
            <p>The selected route is no longer available for the current filters.</p>
            <button
                type="button"
                className="themed-divider themed-text-muted rounded border p-2 font-medium transition hover:opacity-80"
                onClick={onBackToRoutes}
            >
                Back to routes
            </button>
        </div>
    );
}
