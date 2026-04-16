import { DepartureView, DepartureViewProps } from "./departureView";

type MapDeparturesPanelViewProps = {
    departureViewProps: DepartureViewProps;
};

export function MapDeparturesPanelView({ departureViewProps }: MapDeparturesPanelViewProps) {
    return (
        <aside className="pointer-events-auto z-[1000] w-[min(420px,calc(100vw-2rem))]">
            <section className="overlay-panel flex max-h-[calc(100vh-2rem)] flex-col gap-3 overflow-y-auto pr-1">
                <h2 className="overlay-panel-title">Departures</h2>
                <DepartureView {...departureViewProps} />
            </section>
        </aside>
    );
}
