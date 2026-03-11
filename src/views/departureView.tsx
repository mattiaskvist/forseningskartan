import { Departure } from "../types/sl";

type DepartureViewProps = {
    departures: Departure[];
};

export function DepartureView({ departures }: DepartureViewProps) {
    function renderDepartureCB(departure: Departure) {
        return (
            <div key={departure.journey.id}> {/* not sure that this works as a key */}
                <h1>{departure.direction}</h1>
                <p>Scheduled: {departure.scheduled}</p>
                {departure.expected && <p>Expected: {departure.expected}</p>}
            </div>
        );
    }

    return (
        <div>
            {departures.map(renderDepartureCB)}
        </div>
    );
}



