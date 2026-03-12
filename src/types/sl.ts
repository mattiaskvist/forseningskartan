// https://www.trafiklab.se/sv/api/our-apis/sl/transport/#openapi-specification

type Site = {
    id: number;
    gid: number;
    name: string;
    lat: number;
    lon: number;
    stop_areas?: number[];
};

type DepartureDeviation = {
    importance_level: number;
    consequence: string;
    message: string;
};

type Departure = {
    direction: string;
    direction_code: 0 | 1 | 2;
    via?: string;
    destination?: string;
    state:
        | "NOTEXPECTED"
        | "NOTCALLED"
        | "EXPECTED"
        | "CANCELLED"
        | "INHIBITED"
        | "ATSTOP"
        | "BOARDING"
        | "BOARDINGCLOSED"
        | "DEPARTED"
        | "PASSED"
        | "MISSED"
        | "REPLACED"
        | "ASSUMEDDEPARTED";
    scheduled: string;
    expected?: string;
    display: string;
    journey: {
        id: number;
        state:
            | "NOTEXPECTED"
            | "NOTRUN"
            | "EXPECTED"
            | "ASSIGNED"
            | "CANCELLED"
            | "SIGNEDON"
            | "ATORIGIN"
            | "FASTPROGRESS"
            | "NORMALPROGRESS"
            | "SLOWPROGRESS"
            | "NOPROGRESS"
            | "OFFROUTE"
            | "ABORTED"
            | "COMPLETED"
            | "ASSUMEDCOMPLETED";
        prediction_state?: "NORMAL" | "LOSTCONTACT" | "UNRELIABLE";
        passenger_level?:
            | "EMPTY"
            | "SEATSAVAILABLE"
            | "STANDINGPASSENGERS"
            | "PASSENGERSLEFTBEHIND"
            | "UNKNOWN";
    };
    stop_area: {
        id: number;
        name: string;
        sname?: string; // short name
        type?:
            | "BUSTERM"
            | "METROSTN"
            | "TRAMSTN"
            | "RAILWSTN"
            | "SHIPBER"
            | "FERRYBER"
            | "AIRPORT"
            | "TAXITERM"
            | "UNKNOWN";
    };
    stop_point: {
        id: number;
        name?: string;
        designation?: string;
    };
    line: {
        id: number;
        designation?: string;
        transport_mode?: "BUS" | "TRAM" | "METRO" | "TRAIN" | "FERRY" | "SHIP" | "TAXI";
        group_of_lines?: string;
    };
    deviations?: DepartureDeviation[];
};

type StopDeviation = {
    id: number;
    importance_level: number;
    message: string;
    // also has scope
};

type DepartureResponse = {
    departures?: Departure[];
    stop_deviations: StopDeviation[];
};

export type { Site, DepartureResponse, Departure };
