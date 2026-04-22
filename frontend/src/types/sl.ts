// https://www.trafiklab.se/sv/api/our-apis/sl/transport/#openapi-specification

import { RouteType } from "./historicalDelay";

type Site = {
    id: number;
    gid: number;
    name: string;
    lat: number;
    lon: number;
    stop_areas?: number[];
};

type StopArea = {
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
    stop_area: StopArea;
    stop_point: {
        id: number;
        name?: string;
        designation?: string;
    };
    line: {
        id: number;
        designation?: string;
        transport_mode?: TransportationMode;
        group_of_lines?: string;
    };
    deviations?: DepartureDeviation[];
};

type TransportationMode = "BUS" | "TRAM" | "METRO" | "TRAIN" | "FERRY" | "SHIP" | "TAXI";

export const transportationModeToRouteType: { [K in TransportationMode]: RouteType } = {
    BUS: "700",
    TRAM: "900",
    METRO: "401",
    TRAIN: "100",
    FERRY: "1000",
    SHIP: "1000",
    TAXI: "1501",
};

export const transportationModes = Object.entries(transportationModeToRouteType) as [
    TransportationMode,
    RouteType,
][];

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

type StopPoint = {
    id: number;
    gid: string;
    name?: string;
    sname?: string; // short name
    designation?: string;
    type:
        | "PLATFORM"
        | "BUSSTOP"
        | "ENTRANCE"
        | "EXIT"
        | "GATE"
        | "REFUGE"
        | "PIER"
        | "TRACK"
        | "UNKNOWN";
    has_entrance: boolean;
    lat?: number;
    lon?: number;
    stop_area: StopArea;
};

export type { Site, DepartureResponse, Departure, StopPoint, TransportationMode };
