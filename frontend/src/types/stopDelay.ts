import type { DelaySummary } from "./historicalDelay";
export type StopDelayRequestStatus = "loading" | "succeeded" | "failed";

export type StopDelayRequestKey = `${string}:${string}`; // `${stopPointGID}:${date}`

export type StopDelayCacheEntry = {
    data: DelaySummary | null;
    status: StopDelayRequestStatus;
    error: string | null;
};

export function getStopDelayRequestKey(stopPointGID: string, date: string): StopDelayRequestKey {
    return `${stopPointGID}:${date}`;
}
